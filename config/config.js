module.exports = {
    HOST: "localhost",
    //  HOST: "api.shopzone.com.au",
    PORT: "5000",
      // USER: "shopzone_api", 
    USER: "root",
      // PASSWORD: "shopzone_api",  
    PASSWORD: "",
      DB: "wiser_api",
    // DB: "shopzone", 
    dialect: "mysql",
    JWT_SECRET: "mysecretkey",
    sessionSecret: "hfhahhafajuamfaafamdfarnfnayrefabyfamfhuaeahfa", 
    emailUser: "wolfstech25@gmail.com", 
    emailPassword: "gsjsprtdyhrhlasa",
    // url: "http://localhost:8000/", 
    url: "https://api.shopzone.com.au/",
  
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
  };
  