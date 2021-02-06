const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

// This will match Sr Developer, Sr. Developer, or Senior Developer. It'll also match Sasparilla Developer, but the false positives here should be pretty low.
const jobTitleRegex = /s.*r.*dev/i;
const jobListingUrl = "https://www.governmentjobs.com/careers/colorado?department[0]=Governor%27s%20Office%20of%20Information%20Technology&sort=PositionTitle%7CAscending&keywords=developer";

const homeAssistantSettings = {
	url: "",   // endpoint to call. E.g., https://192.168.1.50:8123/api/services/notify/mobile_app_steves_iphone
	token: ""  // API token
}

// Use fetch to execute our Home Assistant API call. 
const notify = (positions) => {
	// Craft the notification message based on how many results we got. If we just got one, include the job title. Otherwise just say how many matched.
	// If we got more than one result, just use the index page for the URL. Otherwise use the specific job posting's URL.
	const notificationMsg = `${positions.length === 1 ? "A" : positions.length}${positions.length === 1 ? " " + positions[0].title : ""} position${positions.length > 1 ? "s" : ""} just opened up!`;
	fetch(homeAssistantSettings.url, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${homeAssistantSettings.token}`
		},
		body: JSON.stringify({ message: notificationMsg, data: { url: positions.length > 1 ? jobListingUrl : positions[0].url } })
	})
		.then(r => {
			if (r.status !== 200) {
				throw "Notification failed!";
			}
			return r;
		})
		.then(r => {
			console.log(r, "Notificaton sent!");
		});
}

const check = async () => {
	console.log(`${new Date().toLocaleString()} Checking...`);
	// Start up the headless browser and navigate to our listings page
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(jobListingUrl);

	// The listings come in from a separate call once the page has loaded, so wait for a job title selector to exist
	await page.waitForSelector(".job-table-title")
	const positions = await page.evaluate(() => {
		// Grab the links for each job posting and return a list of objects containing the job title and the listing URL for that position
		const listings = [...document.querySelectorAll(".job-table-title > h3 > a")];
		return listings.map(a => ({ title: a.textContent, url: a.href }));
	});

	await browser.close();

	// See if we have any matches based on our regex
	const matches = positions.filter(p => jobTitleRegex.exec(p.title));
	if (matches.length) {
		console.log(`${new Date().toLocaleString()} Found ${matches.length} matches!`);
		console.log(matches);
		notify(matches);
	}

};


// Check once per hour
check();
setInterval(check, 60 * 60 * 1000)

