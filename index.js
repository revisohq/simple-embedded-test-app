
require('dotenv').config();
let express = require('express');
let request = require('request');
let app = express();

let restUrl = process.env.RESTURL;
let appSecret = process.env.APPSECRET;

if (!restUrl || !appSecret)
{
	console.log('cannot run without restUrl nor appSecret');
}

let exchangeUrl = restUrl + 'apps-auth/grant-token/';

let baseHeaders = {
	'X-AppSecretToken': appSecret
};

app.get('/:value', (req, res) => {
	var value = req.params.value;
	var eaToken = req.query.embeddedAppToken;

	var exchangeForGrant = {
		url: exchangeUrl + eaToken,
		headers: baseHeaders		
	};

	request(exchangeForGrant, (error, response, body) => {
		if (error || response.statusCode != 200) {
			console.log('exchange error', error, body);
		}

		let grantToken = body;
		console.log('exchanged for grantToken: ' + grantToken);
		
		var getCompanyInfo = {
			url: restUrl + 'self/company',
			headers: Object.assign({}, baseHeaders, { 'X-AgreementGrantToken' : grantToken })	
		}
		request(getCompanyInfo, (subError, subResponse, subBody) => {
			if (subError || subResponse.statusCode != 200) {
				console.log('company error', subError, response);
				return;
			}

			let companyInfo = JSON.parse(subBody);
			res.json(companyInfo);
		});
	});
}); 

app.listen(3000, () => console.log('Example app listening on port 3000'));