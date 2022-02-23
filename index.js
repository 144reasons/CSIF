const { download, toWAV, toOGG } = require('./lib/index')
const imgUrl = 'https://picsum.photos/400';
const fs = require('fs')

const newSSTV = async (repeat) => {
	const file = await download(imgUrl, `${__dirname}`);

	console.log(file);

	await toWAV(`${__dirname}/${file}`, '/home/samu/git/CSIF/wav');

	const newName = file.slice(0, -4) + '.wav';

	console.log(newName);

	await new Promise(resolve => setTimeout(resolve, 5000));

	await toOGG(`${__dirname}/wav/${newName}`, '/home/samu/git/CSIF/ogg');

	const finalName = newName.replace(/[.]wav/g, '.ogg');

	await new Promise(resolve => setTimeout(resolve, 500));

	fs.stat(`${__dirname}/ogg/${finalName}`, function(err, stats) {
		console.log(stats);

		if (err) {
			return console.error(err);
		}

		fs.appendFile('list.txt', `\n/home/samu/git/CSIF/ogg/${finalName}`, function(err) {
			if (err) {
				console.log('error writing');
			}
			else {
				console.log('writing complete');
			}
		});
	});

	fs.stat(`${__dirname}/wav/${newName}`, function(err, stats) {
		console.log(stats);

		if (err) {
			return console.error(err);
		}

		fs.unlink(`${__dirname}/wav/${newName}`, function(err) {
			if(err) return console.log(err);
			console.log('file deleted successfully');
		});
	});

	fs.stat(`${__dirname}/${file}`, function(err, stats) {
		console.log(stats);

		if (err) {
			return console.error(err);
		}

		fs.unlink(`${__dirname}/${file}`, function(err) {
			if(err) return console.log(err);
			console.log('file deleted successfully');
		});
	});
};

for(let i = 0; i < 1; i++) {
	newSSTV();
}