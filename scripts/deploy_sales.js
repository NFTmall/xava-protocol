const hre = require("hardhat");
const { saveContractAddress, getSavedContractAddresses } = require('./utils')
const config = require("./saleConfig.json");
const { ethers, web3 } = hre

async function getCurrentBlockTimestamp() {
    return (await ethers.provider.getBlock('latest')).timestamp;
}

async function main() {

    const contracts = getSavedContractAddresses()[hre.network.name];
    const c = config[hre.network.name];

    const salesFactory = await hre.ethers.getContractAt('SalesFactory', contracts['SalesFactory']);

    const tx = await salesFactory.deploySale();
    console.log('Sale deployed.');


    const lastDeployedSale = await salesFactory.getLastDeployedSale();
    console.log('Deployed Sale is: ', lastDeployedSale);


    const sale = await hre.ethers.getContractAt('AvalaunchSale', lastDeployedSale);
    console.log('Successfully instantiated sale contract.');


    const totalTokens = ethers.utils.parseEther(c['totalTokens']);
    console.log('Total tokens to sell: ', c['totalTokens']);

    const tokenPriceInAvax = ethers.utils.parseEther(c['tokenPriceInAvax']);
    console.log('Token price in AVAX: ', c['tokenPriceInAvax']);

    const registrationDepositAVAX = ethers.utils.parseEther(c['registrationDepositAVAX']);
    console.log('Registration deposit AVAX is: ', c['registrationDepositAVAX']);

    const saleOwner = c['saleOwner'];
    console.log('Sale owner is: ', c['saleOwner']);


    const registrationStart = c['registrationStartAt'];
    const registrationEnd = registrationStart + c['registrationLength'];
    const validatorRound = registrationEnd + c['delayBetweenRegistrationAndSale'];
    const publicRound = validatorRound + c['roundLength'];
    const stakingRound = publicRound + c['roundLength'];
    const saleEndTime = stakingRound + c['roundLength'];

    const tokensUnlockTime = c['TGE'];

    await sale.setSaleParams(
        c['tokenAddress'],
        saleOwner,
        tokenPriceInAvax,
        totalTokens,
        saleEndTime,
        tokensUnlockTime,
        c['portionVestingPrecision'],
        c['stakingRoundId'],
        registrationDepositAVAX
    );

    console.log('Sale Params set successfully.');


    await sale.setRegistrationTime(
        registrationStart,
        registrationEnd
    );

    console.log('Registration time set.');

    await sale.setRounds(
        [validatorRound, publicRound, stakingRound],
        [ethers.utils.parseEther('70000000'),ethers.utils.parseEther('70000000'),ethers.utils.parseEther('70000000')]
    );

    const unlockingTimes = c['unlockingTimes'];
    const percents = c['portionPercents'];

    console.log('Unlocking times: ', unlockingTimes);
    console.log('Percents: ', percents);
    console.log('Precision for vesting: ', c['portionVestingPrecision']);
    console.log('Max vesting time shift in seconds: ', c['maxVestingTimeShift']);

    await sale.setVestingParams(unlockingTimes, percents, c['maxVestingTimeShift']);

    console.log('Vesting parameters set successfully.');

    console.log({
        saleAddress: lastDeployedSale,
        saleToken: c['tokenAddress'],
        saleOwner,
        tokenPriceInAvax: tokenPriceInAvax.toString(),
        totalTokens: totalTokens.toString(),
        saleEndTime,
        tokensUnlockTime,
        registrationStart,
        registrationEnd,
        validatorRound,
        stakingRound,
        publicRound,
        registrationDepositAVAX: c['registrationDepositAVAX']
    });
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
