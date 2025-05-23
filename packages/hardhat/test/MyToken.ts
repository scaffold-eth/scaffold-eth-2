import hre from 'hardhat';
import { expect } from 'chai';

describe('MyToken', () => {
    let token: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    const toWei = (value: string) => hre.ethers.parseUnits(value, 18);

    beforeEach(async () => {
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        const MyToken = await hre.ethers.getContractFactory('MyToken');
        token = await MyToken.deploy(toWei('1000000'));
        await token.waitForDeployment();
    });

    it('assigns initial supply to deployer', async () => {
        const balance = await token.balanceOf(owner.address);
        expect(balance).to.equal(toWei('1000000'));
    });

    it('allows minting by MINTER_ROLE', async () => {
        const amount = toWei('1000');
        await token.mint(addr1.address, amount);
        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(amount);
    });

    it('rejects minting by non-minters', async () => {
        const amount = toWei('1000');
        await expect(token.connect(addr1).mint(addr2.address, amount)).to.be.revertedWith('AccessControl:');
    });

    it('allows burning', async () => {
        const burnAmount = toWei('500');
        await token.burn(burnAmount);
        const balance = await token.balanceOf(owner.address);
        expect(balance).to.equal(toWei('1000000') - burnAmount);
    });

    it('pauses transfers', async () => {
        await token.pause();
        await expect(token.transfer(addr1.address, 1)).to.be.revertedWith('Pausable: paused');
    });

    it('rejects pause by non-pauser', async () => {
        await expect(token.connect(addr1).pause()).to.be.revertedWith('AccessControl:');
    });

    it('unpauses transfers', async () => {
        await token.pause();
        await token.unpause();
        await expect(token.transfer(addr1.address, 100)).to.not.be.reverted;
    });

    it('assigns roles correctly', async () => {
        const MINTER_ROLE = await token.MINTER_ROLE();
        const PAUSER_ROLE = await token.PAUSER_ROLE();
        expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true;
        expect(await token.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });
});
