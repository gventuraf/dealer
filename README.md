# dealer

### Extremely simple REST middleware between request and response for Deno

<br>

***

### Example:

```js
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
```

<br>

***

### Usage "guidelines":

<br>

The usage is pretty straightforward and it's really only what's in the example. The parameter given to `dealer.deal()` is the same you would give to Deno's `serve()`.

If the required parameters are not given or if the type conversion specified cannot be performed or some other things goes wrong, the *dealer* will send a reply to the client saying so.

But really, if you have any doubts check the code. It's pretty easy to understand because it's not like I have the knowledge to not make it that way anyway.

<br>

***

### Disclaimer:

This is most likely not bulletproof, it's just a lightweight utility that works fine. If you want it to work great you'll need to look somewhere else, locally change it or contribute to it here (thank you!).

<br>

### "Licence":

Use it how, when and where you want it!

<br>

### Hope it help

And if it does, do let me know :)