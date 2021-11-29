const axios = require('axios');
const Oportunity = require("@oportunity");
const { XMLBuilder } = require("fast-xml-parser");


module.exports = {
    async registerInBling(req, res) {
        try {

            //GET DEALS WON
            const response = await axios.get(`${process.env.PIPEDRIVE_URL}/v1/deals`, {
                params: {
                    api_token: process.env.PIPEDRIVE_KEY
                }
            })
            const deals = response.data.data;
            const wonDeals = deals.filter(deal => deal.status === 'won');
           
            //FOR EACH DEAL, GET THE PRODUCTS AND REGISTER THE ORDER IN BLING
            var orders = []

            const bling_orders_request = await axios.get(`${process.env.BLING_URL}/pedidos/json/?apikey=${process.env.BLING_KEY}`)

            wonDeals.forEach(async wonDeal => {
                const bling_orders = bling_orders_request.data.retorno.pedidos;
                var exists_register_in_bling = false;
                if (bling_orders) {
                    bling_orders.forEach(bling_order => {
                        if (bling_order.pedido.cliente.nome == wonDeal.org_id.name) exists_register_in_bling = true;
                    })
                }

                if (!exists_register_in_bling) {
                    var order = {
                        "pedido": {
                            "cliente": {
                                "nome": wonDeal.org_id.name,
                            }
                        }
                    }
                    const response_products = await axios.get(`${process.env.PIPEDRIVE_URL}/v1/deals/${wonDeal.id}/products`, {
                        params: {
                            api_token: process.env.PIPEDRIVE_KEY
                        }
                    })
                    var products = response_products.data.data

                    var items = []
                    products.forEach(async product => {
                        product_object = {
                            "item": {
                                "codigo": product.id,
                                "descricao": product.name,
                                "qtde": parseFloat(product.quantity),
                                "vlr_unit": parseFloat(product.item_price)
                            }
                        }
                        items.push(product_object)
                    })
                    order.pedido.itens = items;
                
                    const builder = new XMLBuilder();
                    const xmlContent = builder.build(order);
                    try {
                        const response = await axios.post(`${process.env.BLING_URL}/pedido/json/?apikey=${process.env.BLING_KEY}&xml=${xmlContent}`)
                        await Oportunity.create({
                            "customer": wonDeal.org_id.name,
                            "date": wonDeal.won_time,
                            "value": wonDeal.weighted_value
                        });
                    }
                    catch (err) {
                        console.log(err.message)
                    }
                }
            })
            return res.status(201).send({ "Success": "Operação realizada com sucesso!" });
        }
        catch (err) {
            return res.status(400).send({ "error": err.message });
        }
    },

    async getOportunities(req, res) {
        try {
            const oportunities = await Oportunity.find();
            if(!oportunities) return res.status(200).json("Não há negócios cadastrados!");
            return res.status(200).json(oportunities);
        }
        catch (err) {
            return res.status(400).send({ "error": err.message });
        }
    }
}