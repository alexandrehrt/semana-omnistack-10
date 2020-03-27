const axios = require("axios");
const Dev = require("../models/Dev");
const parseStringAsArray = require("../utils/parseStringAsArray");
const { findConnections, sendMessage } = require("../websocket");

module.exports = {
  // SHOW ALL USERS
  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },

  // ADD USER
  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username }); // Search for duplicate user
    if (!dev) {
      const response = await axios.get(
        `https://api.github.com/users/${github_username}`
      );

      const { name = login, avatar_url, bio } = response.data;

      const techsArray = parseStringAsArray(techs);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude]
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      });

      // Filter: connections that are within 10 km and the dev
      // must have at least one of the filtered technologies
      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArray
      );
      sendMessage(sendSocketMessageTo, "new-dev", dev);
    }

    return res.json(dev);
  },

  // UPDATE USER
  async update(req, res) {
    const { github_username } = req.body;

    const dev = await Dev.findOne({ github_username });

    await dev.update(req.body);

    return res.json(req.body);
  },

  // DELETE USER
  async destroy(req, res) {
    const { github_username } = req.body;

    await Dev.findOneAndDelete({ github_username });

    return res.json({ message: `User ${github_username} deleted` });
  }
};
