const fs = require('fs');
const util = require('util');
const packageJson = require("./package.json");
const formPackageJson = require("./nmsud-form/package.json");

const copyFile = util.promisify(fs.copyFile);

const exportFolder = 'data';

async function generateHtml() {
	await copyFile('./CNAME', `./${exportFolder}/CNAME`);
	await generateHtmlForFolder(`./${exportFolder}`, [`<a href="/">🏠 Home</a>`]);
}

async function generateHtmlForFolder(folder, breadcrumbs) {
	let fileLists = [];

	const allFiles = fs.readdirSync(folder, { withFileTypes: true });
	for (const dirent of allFiles) {
		if (dirent.isDirectory()) {
			fileLists.push(getLink(0, dirent.name));
			await generateHtmlForFolder(
				`./${folder}/${dirent.name}`,
				[...breadcrumbs, `<a href="/${dirent.name}">${dirent.name}</a>`]
			);
			continue;
		}

		if (dirent.name.includes('index.html')) continue;
		if (dirent.name.includes('CNAME')) continue;
		if (dirent.name[0] == ".") continue;
		if (dirent.name[0] == "_") continue;
		fileLists.push(getLink(1, dirent.name));
	}

	fileLists.sort();

	let htmlString = `
<!DOCTYPE html>
<html>
<head>
	<title>NMSUD - Data browser</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet">
	<style>
		body {
			background: #1c222f;
			color: #FFFFFF;
			font-family: Roboto;
			margin: 0 2em;
		}
		h3 a,
		ul li a {
			text-decoration: none;
            color: lightblue;
		}
		footer {
			position: absolute;
			bottom: 1em;
		}
	</style>
</head>
<body>

	<h1>NMSUD - Data browser</h1>
	<h3>${breadcrumbs.join('&nbsp;&nbsp;/&nbsp;&nbsp;')}</h3>
	
	<hr />
	
	<ul>
	${fileLists.join('\n\t')}
	</ul>

	<footer>
		<span>Data browser v${packageJson.version}</span>
		<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
		<span>Form version: v${formPackageJson.version}</span>
		<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
		<span>Generated on ${(new Date()).toDateString()}</span>
	</footer>
</body>
</html>
	`;
	fs.writeFile(`${folder}/index.html`, htmlString, ['utf8'], () => { });
}

function getLink(type, name) {
	let emoji = '❓';
	if (type == 0) emoji = '📁';
	if (type == 1) emoji = '📄';
	return `<li data-sort="${type}-${name.toLowerCase()}"><a href="./${name}">${emoji}&nbsp;${name}</a></li>`;
}

generateHtml();