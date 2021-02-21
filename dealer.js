import { serve } from "https://deno.land/std@0.86.0/http/server.ts";

/* Names:
** rest-dealer
** rest-dispatcher
*/

const endpoints = {};

export default class Dealer
{
    add(endpoint)
    {
        if (!endpoint)
            throw 'add() takes a parameter'
        if (!endpoint.path)
            throw `'path' must be given`;
        if (!endpoint.controller)
            throw `'controller' must be given`

        endpoint.method = endpoint.method || 'GET';
        
        endpoints[endpoint.method + endpoint.path] = endpoint;
    }

    async deal(serverinfo)
    {
        const _headers = new Headers();
        _headers.set("content-type", "application/json");
        
        const server = serve(serverinfo);

        for await (const req of server) {

            const queryindex = req.url.indexOf('?');

            const endpoint = endpoints[ req.method + (queryindex>0 ? req.url.substring(0, queryindex) : req.url) ];

            if (!endpoint) {
                req.respond({ status: 404, body: JSON.stringify({ error: 'url not found' }) });
                continue;
            }
            
            //*
            //* parse query:

            const _query = {};

            try {
                
                if (queryindex < 0 && !is_empty(endpoint.params)) {
                    // query parameters were expected and none were given
                    
                    throw { status: 400, error: {error: 'missing query'} };
                
                } else if (queryindex > 0) {
                    // query parameters were expected and some were given
    
                    const queries = decodeURI(req.url).substring(queryindex+1).split('&');
    
                    for (const q of queries) {
    
                        const pair = q.split('=');
                        let type;
    
                        if (pair.length != 2)
                            throw { status: 400, error: {error: 'invalid query parameter'} };
            
                        // check if 'q' is required or mandatory or error
                        if (endpoint.params && !(type = endpoint.params[pair[0]]))
                            if (endpoint.optional_params && !(type = endpoint.optional_params[pair[0]]))
                                throw { status: 400, error: {error: 'invalid query parameter'} };
                        
                        // check if can convert param to desired type or error
                        if (!(_query[pair[0]] = type(pair[1])))
                            throw { status: 400, error: {error: 'invalid query parameter'} };
                    }
    
                    // check if all all required params were given or error
                    for (const p in endpoint.params)
                        if (!_query[p])
                            throw { status: 400, error: {error: 'missing query values'} };
                
                    }
            } catch (err) {
                
                if (err.error)
                    err.error = JSON.stringify(err.error);

                req.respond({
                    headers: _headers,
                    status: err.status || 400,
                    body: err.error || JSON.stringify({ error: 'something went wrong, check query' })
                });

                continue;
            }
            
            //*
            //* get http payload as object:

            const rawrequest = Utf8ArrayToStr(req.r.buf);
                
            const startindex = rawrequest.indexOf('\r\n\r\n')+4;
            const endindex = rawrequest.indexOf('\u0000');
            const rawpayload = rawrequest.substring(startindex, endindex) || '{}';

            const _payload = JSON.parse(rawpayload);

            let resp;

            try {
                
                resp = await endpoint.controller({ query: _query, payload: _payload });
            
            } catch (err) {

                resp.status = err.status || 500;
                resp.body = err.error || { error: 'something went wrong' }
            }

            req.respond({
                headers: _headers,
                status: resp.status || 200,
                body: JSON.stringify(resp.body)
            });
        }
    }
}

function is_empty(o)
{
    for (const k in o)
        if (o.hasOwnProperty(k))
            return false;
    return true;
}


// Thank you, https://ourcodeworld.com/articles/read/164/how-to-convert-an-uint8array-to-string-in-javascript
function Utf8ArrayToStr(array)
{
    const len = array.length;
    let out='', i=0;
    let c, char2, char3;
    
    while(i < len) {
    
        c = array[i++];
        switch(c >> 4)
        {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
            break;
        }
    }
    
    return out;
}
