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
        profile:{
            type: DataTypes.STRING,
            allowNull: true,
        },
           poaDate:{
            type: DataTypes.STRING,
            allowNull: true,
        },
           poaTime:{
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
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        otpExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        failedLoginAttempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
          },
          isBlocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          blockUntil: {
            type: DataTypes.DATE,
            allowNull: true
          },
          isMarkedForDeletion: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          deletionDate: {
            type: DataTypes.DATE,
            allowNull: true
          },
           lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
           status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue:'active'
        }
    }, {
        underscored: false,
        timestamps: true, 
    })

    return User

}