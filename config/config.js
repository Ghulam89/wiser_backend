module.exports = {
  HOST: "localhost",
  PORT: "5000",
  USER: "root",
  PASSWORD: "",
  DB: "wiser_api",
  dialect: "mysql",
  JWT_SECRET: "mysecretkey",
  sessionSecret: "hfhahhafajuamfaafamdfarnfnayrefabyfamfhuaeahfa",
  emailUser: "muslimwearsofficials@gmail.com",
  emailPassword: "fmogzhovwlnadfoq",
emailHost:"smtp.gmail.com",
emailPort:587,
  // url: "http://localhost:5000",
  url: "http://app.oncloudapi.com",

  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 30000,
  },
};
