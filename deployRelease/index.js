// Module dependencies

const request = require("request-promise");

const { managementToken, apiKey, publishEnvironment, baseUrlRegion } = process.env;

let myDate = new Date();

let myDateString =
  myDate.getFullYear() +
  "-" +
  ("0" + (myDate.getMonth() + 1)).slice(-2) +
  "-" +
  ("0" + myDate.getDate()).slice(-2);

const checkItems = async (releaseUid) => {
  let options = {
    method: "GET",
    url: `${baseUrlRegion}v3/releases/${releaseUid}/items`,
    json: true,
    headers: {
      "content-Type": "application/json",
      authorization: managementToken,
      api_key: apiKey,
    },
  };

  let response = await request(options);
  return response.items;
};

const deployReleaseHandler = async (releaseUid) => {
  let options = {
    method: "POST",
    url: `${baseUrlRegion}v3/releases/${releaseUid}/deploy`,
    json: true,
    headers: {
      "content-Type": "application/json",
      authorization: managementToken,
      api_key: apiKey,
    },
    body: {
      release: {
        action: "publish",
        environments: [publishEnvironment],
      },
    },
  };
  try {
    let response = await request(options);
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

const getAllReleases = async () => {
  let options = {
    method: "GET",
    url: `${baseUrlRegion}v3/releases`,
    json: true,
    headers: {
      "content-Type": "application/json",
      authorization: managementToken,
      api_key: apiKey,
    },
  };

  try {
    let response = await request(options);
    return Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

const mainHandler = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let getRelease = await getAllReleases();
      getRelease.releases.map(async (i) => {
        let createdAtDate = i.created_at.split("-");
        let date = createdAtDate[2].split("");
        let releaseDate = createdAtDate[0] + "-" + createdAtDate[1] + "-" + date[0] + date[1];
        let releaseName = i.name
        let dateName = new Date().toDateString();
        if (releaseDate === myDateString && releaseName === `Autogenerated ${dateName}` ) {
          checkItems(i.uid).then(async (items) => {
            if (items.length != 0) {
              let deployResponse = await deployReleaseHandler(i.uid);
              resolve(deployResponse);
              return console.log("Deployed successfully !!")
            } else {
              return console.log("No items to deploy in your release ")
            }
          });
        }
      });
    } catch (error) {
      reject({
        statusCode: 500,
        body: JSON.stringify({
          error,
        }),
      });
    }
  });
};

exports.handler = async (event) => {
  try {
    await mainHandler();
    return {
      statusCode: 200,
      message: `Release deployed for date ${myDateString} !!`,
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
};

