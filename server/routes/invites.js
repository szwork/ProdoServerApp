function init(app) {
  
  app.get('/invite', function (req, res){

  });

  app.get('/invite/signup', function (req, res){

  });
}

app.get('/api/invites', api.invites);
app.get('/api/invites/:id', api.invite);
app.post('/api/invites', api.createInvite);
app.put('/api/invites/:id', api.updateInvite);
app.delete('/api/invites/:id', api.destroyInvite);