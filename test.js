import Dealer from './dealer.js';

var o = {
    method: 'GET',
    path: '/instruments/keys/piano',
    params: {
        minprice: Number,
        maxprice: Number
    },
    optional_params: {
        color: String
    },
    controller: (args) => {
        console.log(args);
        return { status: 201, body: { response: "request received successfully"} };
    }
};

const dealer = new Dealer();

dealer.add(o);

await dealer.deal({ hostname:'0.0.0.0', port:8080 });
