/// <reference types="cypress" />
import contrato from '../contracts/produtos.contract'

describe('Teste da Funcionalidade de Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    });

    it('Deve validar contrato (schema) de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Listar Produtos', () => {
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            expect(response.body.produtos[1].nome).to.contains('Produto')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(15)
        })
    });

    it('Cadastrar Produto', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.cadastrarProduto(token, produto, 233, "Teste", 44).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        });
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.cadastrarProduto(token, "Samsung 60 polegadas", 233, "Teste", 44).then((response) => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal('Já existe produto com esse nome')
        });
    });

    it('Deve editar um produto', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.request('produtos').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: { authorization: token },
                body: {
                    "nome": produto,
                    "preco": 400,
                    "descricao": "Mouse - Oferta",
                    "quantidade": 350
                }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })

    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.cadastrarProduto(token, produto, 233, "Teste", 44).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
            let id = response.body._id

            cy.request('produtos').then(response => {
                let id = response.body.produtos[0]._id
                cy.request({
                    method: 'PUT',
                    url: `produtos/${id}`,
                    headers: { authorization: token },
                    body: {
                        "nome": "Teste Alteração",
                        "preco": 400,
                        "descricao": "Mouse - Oferta",
                        "quantidade": 350
                    }
                }).then(response => {
                    expect(response.body.message).to.equal('Registro alterado com sucesso')
                })
            })

        });

    });

    it('Deve deletar um produto previamente cadastrado', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.cadastrarProduto(token, produto, 233, "Teste", 44).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
            let id = response.body._id

            cy.request({
                method: 'DELETE',
                url: `produtos/${id}`,
                headers: { authorization: token },
            }).then(response => {
                expect(response.body.message).to.contains('excluído')
                expect(response.status).to.equal(200)
            })
        })
    });
});