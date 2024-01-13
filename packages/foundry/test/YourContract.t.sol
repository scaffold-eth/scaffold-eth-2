// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/NotaRegistrar.sol";

contract NotaRegistrarTest is Test {
    NotaRegistrar public notaRegistrar;

    function setUp() public {
        notaRegistrar = new NotaRegistrar(vm.addr(1));
    }

}
