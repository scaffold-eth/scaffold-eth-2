/// <reference types="cypress" />

describe("example app", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("displays Scaffoold-ETH logo text", () => {
    cy.viewport(1920, 1080);
    cy.get("[data-test=logo-text-main]").should("have.text", "Scaffold-ETH");
  });
});
