const { expect } = require("chai");
const { BigNumber } = require("ethers");

function sleep(waitMsec) {
    var startMsec = new Date();

    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec);
}

describe("Token contract", function () {
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await hre.ethers.getSigners();
        _Rilascio = await hre.ethers.getContractFactory("Rilascio");
        _svg = await hre.ethers.getContractFactory("RilascioSVG");
        svg = await _svg.deploy();
        _RilascioO = await hre.ethers.getContractFactory("RilascioO", {
            libraries: {
                RilascioSVG: svg.address,
            },
        });
        _RilascioY = await hre.ethers.getContractFactory("RilascioY", {
            libraries: {
                RilascioSVG: svg.address,
            },
        });
        _NFT = await hre.ethers.getContractFactory("NFT");
        _FT = await hre.ethers.getContractFactory("Weth");
        Rilascio = await _Rilascio.deploy();
        RilascioO = await _RilascioO.deploy(Rilascio.address);
        RilascioY = await _RilascioY.deploy(Rilascio.address);
        NFTForTest = await _NFT.deploy();
        FTforTest = await _FT.deploy();

        expect(await Rilascio.owner()).to.equal(owner.address);
        expect(await RilascioO.owner()).to.equal(owner.address);
        expect(await RilascioY.owner()).to.equal(owner.address);
        await Rilascio.setRilascioO(RilascioO.address);
        await Rilascio.setRilascioY(RilascioY.address);
        await Rilascio.PaymentTokenWhitelist(FTforTest.address, true);
        await Rilascio.deployRilascioW(NFTForTest.address);
        await NFTForTest.mint();
    });

    describe("正常系", function () {
        it("minted nft's owner should be owneraddress", async function () {
            expect(await NFTForTest.ownerOf(1)).to.eq(owner.address);
        });

        it("Deposit And List and total lock volume should be 1", async function () {
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                100,
                10,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            expect(await RilascioO.ownerOf(1)).to.eq(owner.address);
            expect(await RilascioY.ownerOf(1)).to.eq(owner.address);

        });

        it("delete List and total lock volume should be 0", async function () {
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                100,
                10,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            await Rilascio.cancel(1);
            expect(await RilascioY.exists(1)).to.eq(false);
        });

        it("Rent nft and total rent volume should be 1", async function () {
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                100,
                10,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            await FTforTest.connect(user1).mint();
            await FTforTest.connect(user1).approve(Rilascio.address, ethers.utils.parseUnits("10", 16));
            await Rilascio.connect(user1).rent(1, 1, 10);
            expect(await Rilascio.getWrappedOwner(1)).to.eq(user1.address);
            //expect(await Rilascio.claimNFT(1)).to.be.revertedWith('Withdraw can execute after Lock ExpireDate');
            //expect(await Rilascio.claimFT(1)).to.be.revertedWith('Rilascio: can execute after Lock Expire');
        });

        it("Expire rent duration and o,y NFT should be burned", async function () {
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                10,
                10,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            await FTforTest.connect(user1).mint();
            await FTforTest.connect(user1).approve(Rilascio.address, ethers.utils.parseUnits("10", 16));
            await Rilascio.connect(user1).rent(1, 1, 10);
            sleep(12000);
            await Rilascio.claimNFT(1);
            await Rilascio.claimYield(1);
            expect(await RilascioO.exists(1)).to.eq(false);
            expect(await RilascioY.exists(1)).to.eq(false);
        });

        it("rental then return then rental", async function () {
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                1,
                1,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            await FTforTest.connect(user1).mint();
            await FTforTest.connect(user1).approve(Rilascio.address, ethers.utils.parseUnits("10", 16));
            await Rilascio.connect(user1).rent(1, 1, 4);
            expect(await Rilascio.getWrappedOwner(1)).to.eq(user1.address);
            sleep(3000);
            await Rilascio.claimNFT(1);
            await Rilascio.claimYield(1);
            //expect(await NFTForTest.ownerOf(1)).to.eq(Rilascio.address);
            //expect(await RilascioO.exists(1)).to.eq(false);
            //expect(await RilascioY.exists(1)).to.eq(false);

            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                3,
                3,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            await FTforTest.connect(user1).mint();
            await FTforTest.connect(user1).approve(Rilascio.address, ethers.utils.parseUnits("10", 16));
            await Rilascio.connect(user1).rent(2, 1, 10);
            expect(await Rilascio.getWrappedOwner(2)).to.eq(user1.address);
            //expect(await Rilascio.getTotalLockVolume()).to.eq(2);
            //expect(await Rilascio.getTotalRentVolume()).to.eq(2);
        });

        it("rental 3times then return then rental", async function () {
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                3,
                1,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            await FTforTest.connect(user1).mint();
            await FTforTest.connect(user1).approve(Rilascio.address, ethers.utils.parseUnits("10", 16));
            await Rilascio.connect(user1).rent(1, 1, 1);
            expect(await Rilascio.getWrappedOwner(1)).to.eq(user1.address);
            sleep(3000);
            await Rilascio.connect(user1).rent(1, 1, 1);
            expect(await Rilascio.getWrappedOwner(1)).to.eq(user1.address);
            sleep(3000);
            await Rilascio.connect(user1).rent(1, 1, 1);
            expect(await Rilascio.getWrappedOwner(1)).to.eq(user1.address);
            sleep(10000);
            await Rilascio.claimNFT(1);
            await Rilascio.claimYield(1);
            expect(await RilascioO.exists(1)).to.eq(false);
            expect(await RilascioY.exists(1)).to.eq(false);
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                3,
                2,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            expect(await RilascioO.exists(2)).to.eq(true);
            expect(await RilascioY.exists(2)).to.eq(true);
            await FTforTest.connect(user1).mint();
            await FTforTest.connect(user1).approve(Rilascio.address, ethers.utils.parseUnits("10", 16));
            await Rilascio.connect(user1).rent(2, 1, 10);
            expect(await Rilascio.getWrappedOwner(2)).to.eq(user1.address);
        });

        it("transfer o,y NFT to another and withdraw and claim it", async function () {
            await NFTForTest.approve(Rilascio.address, 1);
            await Rilascio.deposit(
                1,
                10,
                10,
                1000000000000000,
                1,
                NFTForTest.address,
                FTforTest.address
            );
            await FTforTest.connect(user1).mint();
            await FTforTest.connect(user1).approve(Rilascio.address, ethers.utils.parseUnits("10", 16));
            await Rilascio.connect(user1).rent(1, 1, 10);
            sleep(12000);
            await RilascioO.transferFrom(owner.address, user1.address, 1);
            await RilascioY.transferFrom(owner.address, user2.address, 1);
            expect(await RilascioO.ownerOf(1)).to.eq(user1.address);
            expect(await RilascioY.ownerOf(1)).to.eq(user2.address);
            await Rilascio.connect(user1).claimNFT(1);
            await Rilascio.connect(user2).claimYield(1);
            expect(await RilascioO.exists(1)).to.eq(false);
            expect(await RilascioY.exists(1)).to.eq(false);
        });
    });
});
