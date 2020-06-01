//Module dependencies

const request = require("request-promise");

const { managementToken, apiKey, baseUrlRegion } = process.env;

let date = new Date().toDateString();

const createReleaseHandler = async () => {
  let options = {
    method: "POST",
    url: `${baseUrlRegion}v3/releases`,
    json: true,
    headers: {
      "content-Type": "application/json",
      authorization: managementToken,
      api_key: apiKey,
    },
    body: {
      release: {
        name: `Autogenerated ${date}`,
        description: `This is autogenerated release for date ${date}`,
        locked: false,
        archived: false,
      },
    },
  };
  let response = await request(options);
  return Promise.resolve(response);
};

exports.handler = async (event) => {
  try {
    await createReleaseHandler();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Release created for date ${date}` }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
