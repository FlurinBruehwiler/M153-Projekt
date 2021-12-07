import React from "react";

export default class App extends React.Component{

  state = {
    loading: true,
    film: null,
    name: ""
  }

  async componentDidMount(){
    const url = "/filme";
    const response = await fetch(url);
    const data = await response.json();
    this.setState({film: JSON.stringify(data[0]), loading: false});
  }

 handleChange = event => {
   this.setState({name: event.target.value});
 };
    
  

  render(){
    return <div>
      {(this.state.loading || !this.state.film )?( <div>loading...</div>) : 
        (<div><div>{this.state.film}</div></div>)
      }
      <div><input  value ={this.state.name}onChange={this.handleChange} /></div>
      {this.state.name}
    </div>
  }
}