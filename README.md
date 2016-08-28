# Description
Node JS library to extract metrics from <http://fabric.io> .

There is no official API for Fabric.io information. 
So this is the next best thing (reverse engineered from the browser API calls)

It uses *zombie.js* to simulate a login into the website and uses *request* extracts the correct API tokens. (csrf_token, developer_token, access_token).

The api calls return the raws JSON data from the API response.

```
export FABRIC_EMAIL=
export FABRIC_PASSWORD=
export FABRIC_ORGANIZATION_ID=
export FABRIC_APP_ID=
```
