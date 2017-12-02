import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/inputCustomizado';
import BotaoSubmit from './componentes/botaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

class FormularioAutor extends Component {

    constructor() {
        super();
        this.state = {nome:'', email:'', senha:''};
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();

        $.ajax({
            url:"http://localhost:8080/api/autores",
            dataType:"json",
            contentType:"application/json",
            type:"post",
            data:JSON.stringify({
                nome: this.state.nome,
                email: this.state.email,
                senha: this.state.senha
            }),
            success: function(novaLista) {
                PubSub.publish('atualiza-lista-autores', novaLista);
                this.setState({nome:'', email:'', senha:''});
            }.bind(this),
            error: function(resposta) {
                if(resposta.status === 400) {
                    console.log("Error!");
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function(){
                PubSub.publish('limpa-erros', {});
            }
        });
    }

    setNome(evento) {
        this.setState({nome:evento.target.value});
    }

    setEmail(evento) {
        this.setState({email:evento.target.value});
    }

    setSenha(evento) {
        this.setState({senha:evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado label="Nome" id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome} />
                    <InputCustomizado label="Email" id="email" type="email" name="email" value={this.state.email} onChange={this.setEmail} />
                    <InputCustomizado label="Senha" id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setSenha} />

                    <BotaoSubmit label="Gravar"/>
                </form>
            </div>
        );
    }
}

class TabelaAutores extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>email</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map(function(autor){
                                return (
                                    <tr key={autor.id}>
                                        <td>{autor.nome}</td>
                                        <td>{autor.email}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {

    constructor() {
        super();
        this.state = {lista: []};
    }

    render() {
        return(
            <div>
                <FormularioAutor/>
                <TabelaAutores lista={this.state.lista}/>
            </div>

        );
    }

    //Called after the mount of component
    componentDidMount() {
        $.ajax({
            url: "http://localhost:8080/api/autores",
            //url: "https://cdc-react.herokuapp.com/api/autores",
            dataType: "json",
            success: function(resposta) {
                //With set State react will update the screen
                this.setState({lista: resposta});
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-autores', function(topico, novaLista) {
            this.setState({lista: novaLista});
        }.bind(this));
    }
}