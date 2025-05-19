module.exports=(sequelize,DataTypes)=>{
    const User=sequelize.define('user',{
        role:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        email:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        profile:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
           poaDate:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
           poaTime:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        password:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        phone:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        residence:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fullName:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        CPRNumber:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        passportNumber:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        address:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        nationality:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        CPRFrontSide:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        CPRBackSide:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        CPRReader:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        passport:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ownerName:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ownerPassportNumber:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ownerNationality:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        partnerName:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        partnerPassportNumber:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        partnerNationality:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        partnerShares:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        boardDirectors:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companyName:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companyActivites:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companyAddress:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        companyYear:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        juniorEmployees:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        seniorEmployees:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        commercialAccount:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        otp: {
            type: DataTypes.TEXT,
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
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue:'active'
        }
    }, {
        underscored: false,
        timestamps: true, 
    })

    return User

}