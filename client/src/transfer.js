/**
 * Created by wangh09 on 2018/1/16.
 */

let inkClient = require("./inkClient");

inkClient.transfer("ib4867fc39737051fa280708a966f2ce36148691d", "INK", "10000000000000000", 'test', 'b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105').then((res) => {
    console.log(JSON.stringify(res));
});
