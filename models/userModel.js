module.exports=(sequelize,DataTypes)=>{
    const User=sequelize.define('user',{
        role:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        email:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        password:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        residence:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        fullName:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        CPRNumber:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        passportNumber:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        address:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        nationality:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        CPRFrontSide:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        CPRBackSide:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        CPRReader:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        passport:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        ownerName:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        ownerPassportNumber:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        ownerNationality:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        partnerName:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        partnerPassportNumber:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        partnerNationality:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        partnerShares:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        boardDirectors:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        companyName:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        companyActivites:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        companyAddress:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        companyYear:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        juniorEmployees:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        seniorEmployees:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        commercialAccount:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        lat:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        lng:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        city:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        country:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        postalCode:{
            type: DataTypes.STRING,
            allowNull: true,
        }, 
    }, {
        underscored: false,
        timestamps: true, 
    })

    return User

}