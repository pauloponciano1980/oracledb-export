const crypto = require('crypto');
function Encriptor()
{
	this.key = Buffer.from('5ebe2294ecd0e0a08eab7690d2a6ee69', 'hex');
	this.iv  = Buffer.from('26ae5cc854e36b6bdfca366848dea6bb', 'hex');

	this.encrypt = function encrypt(text)
	{
		const cipher = crypto.createCipheriv('aes-128-cbc', this.key, this.iv);
		var crypted = cipher.update(text,'utf8','hex')
		crypted += cipher.final('hex');
		return crypted;
	}

	this.decrypt = function decrypt(text)
	{
		var decipher = crypto.createDecipheriv('aes-128-cbc', this.key, this.iv);
		var dec = decipher.update(text,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}
}
var encriptor = new Encriptor();

let original = "bom dia";
let encrypted = encriptor.encrypt(original);
let decripted = encriptor.decrypt(encrypted);


console.log("original ", original  )
console.log("encrypted", encrypted )
console.log("decripted", decripted )