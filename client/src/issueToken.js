let inkClient = require("./inkClient");

inkClient.issueToken('INK', '1000000000000000000', '9', 'i411b6f8f24F28CaAFE514c16E11800167f8EBd89').then((res) => {
    console.log(JSON.stringify(res));
});