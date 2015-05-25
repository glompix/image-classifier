var user = {
  email: 'glompix@gmail.com',
  name: 'Stuart Branham',
  collabSets: ['sets which the user can identify objects in'],
  ownedSets: ['sets that the user can administer']
};

module.exports.get = function() { return user; };
