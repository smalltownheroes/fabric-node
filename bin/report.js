#!/usr/bin/env node
const Client = require('../lib/index.js')

var client = new Client()

var email = process.env['FABRIC_EMAIL'];
var password = process.env['FABRIC_PASSWORD'];
var organization_id = process.env['FABRIC_ORGANIZATION_ID'];
var app_id = process.env['FABRIC_APP_ID'];

client.login(email,password, function(err) {

  /*
  client.active_now(organization_id,app_id, function(err) {
    if (err) { console.log(err) } console.log(data)
  })
  */

 /*
  client.daily_new(organization_id,app_id, function(err) {
    if (err) { console.log(err) } console.log(data)
  })
  */

  client.retention(organization_id,app_id, function(err) {
    if (err) { console.log(err) } console.log(data)
  })

})
