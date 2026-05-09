const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0', { serverSelectionTimeoutMS: 15000 });

client.connect()
    .then(() => {
        console.log('Connected!');
        return client.db().admin().listDatabases();
    })
    .then((result) => {
        const dbNames = result.databases.map(d => d.name);
        console.log('Databases:', dbNames);
        const promises = dbNames.map(name =>
            client.db(name).listCollections().toArray().then(cols => {
                console.log(name, '->', cols.map(c => c.name));
            })
        );
        return Promise.all(promises);
    })
    .then(() => client.close())
    .then(() => console.log('Done'))
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
