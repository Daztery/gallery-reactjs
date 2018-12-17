import React, { Component } from 'react';
import FileUpload from './FileUpload'
import '../css/App.css';
import firebase from 'firebase'

class App extends Component {

  constructor(){
    super();
    this.state={
      user:null,
      pictures:[],
      uploadValue: 0
    };
    this.handleAuth=this.handleAuth.bind(this);
    this.handleLogout=this.handleLogout.bind(this);
    this.handleUpload=this.handleUpload.bind(this);
  }

  componentWillMount(){
    firebase.auth().onAuthStateChanged(user=>{ 
      this.setState({user});
    });

    firebase.database().ref('pictures').on('child_added',snapshot =>{
      this.setState({
        pictures: this.state.pictures.concat(snapshot.val())
      });
    });
  }

  handleAuth(){
    const provider= new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
    
    /*.then(function (result){
      return console.log(...)
    })*/ 

      .then(result =>console.log(`${result.user.email} ha iniciado sesión`))
      .catch(error =>console.log(`Error ${error.code}: ${error.message}`))
  }
 

    handleLogout(){
      firebase.auth().signOut()
      .then(result =>console.log(`${result.user.email} ha salido`))
      .catch(error =>console.log(`Error ${error.code}: ${error.message}`))
    }


    handleUpload(event){
      const file = event.target.files[0];
      const storageRef = firebase.storage().ref(`/fotos/${file.name}`);
      const task = storageRef.put(file);
      task.on('state_changed', snapshot => {
          let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.setState({
              uploadValue: percentage
          })
      }, error => { 
          console.log(error.message) 
      }, () =>  storageRef.getDownloadURL().then(url =>  {
          const record = {
            photoURL: this.state.user.photoURL,
            displayName: this.state.user.displayName,
            image: url
          };
          const dbRef = firebase.database().ref('pictures');
          const newPicture = dbRef.push();
          newPicture.set(record);
      }));
    }
  renderLoginButton(){
    //If the user was logged
    if(this.state.user){
      return (
        <div>
          <img width="100" src={this.state.user.photoURL} alt={this.state.user.displayName}/>
          <p>Hola {this.state.user.displayName}</p>
          <button onClick={this.handleLogout}> Salir </button>

          <FileUpload onUpload={this.handleUpload} uploadValue={this.state.uploadValue}/>
        
          {
            this.state.pictures.map(picture=>(
              <div>
                <img src={picture.image} alt=""/>
              </div>
            ))
          }
        </div>
      );
    }
    else{
      return(
      <button onClick={this.handleAuth}> Login con Google</button>
      );
    }
   
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 >Copy of Instagram</h1>
        </header>
        <p className="App-intro">
          {this.renderLoginButton()}
        </p>
      </div>
    );
  }
}


export default App;
