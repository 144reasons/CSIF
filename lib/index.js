const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const imgUrl = 'https://picsum.photos/800';
const lUrl = 'https://picsum.photos/v2/list';
const { exec } = require('child_process');

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

const download = async (fileUrl, downloadFolder) => {
	const fileName = getRandomInt(10000).toString() + '.jpg';

	const localFilePath = path.resolve(__dirname, downloadFolder, fileName);
	try {
		const response = await axios({
			method: 'GET',
			url: fileUrl,
			responseType: 'stream',
		});

		const w = response.data.pipe(fs.createWriteStream(localFilePath));
		w.on('finish', () => {
			console.log('Successfully downloaded file!');
		});
	}
	catch (err) {
		throw new Error(err);
	}

	return fileName;
};

const bulkDownload = async (listUrl, downloadFolder) => {
	const list = await axios(listUrl);
	console.log(list);
	list.data.forEach(async (item, index) => {
		download(item.download_url, downloadFolder);
	});
};

const toWAV = async (img, resultsFolder) => {
	const newName = img.slice(0, -4) + '.wav';

	exec(`python -m pysstv --mode PD90 ${img} ${resultsFolder}/${newName}`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
	});
};

const toOGG = async (wav, resultsFolder) => {
	console.log(wav);
	let newName = wav.replace(/[.]wav/g, '.ogg');
	newName = newName.replace(/[.][/]wav/, '');
	console.log(newName);

	exec(`ffmpeg -i ${wav} -acodec libvorbis ${resultsFolder}/${newName}`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
	});
};

const newSSTV = async (repeat) => {
	const file = await download(imgUrl, '.');

	console.log(file);

	await toWAV(`./${file}`, '/home/samu/CSIC/wav/');

	const newName = file.slice(0, -4) + '.wav';

	console.log(newName);

	await new Promise(resolve => setTimeout(resolve, 5000));

	await toOGG(`./wav/${newName}`, '/home/samu/CSIC/ogg');

	const finalName = newName.replace(/[.]wav/g, '.ogg');

	await new Promise(resolve => setTimeout(resolve, 500));

	fs.stat(`${__dirname}/ogg/${finalName}`, function(err, stats) {
		console.log(stats);

		if (err) {
			return console.error(err);
		}

		fs.appendFile('list.txt', `\n/home/samu/CSIC/ogg/${finalName}`, function(err) {
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

module.exports = {
	download,
	toWAV,
	toOGG,
	newSSTV
}