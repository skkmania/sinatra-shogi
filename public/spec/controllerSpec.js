describe("gameController", function() {

  it("should have player property", function() {
    var settings = {logTitle:'spec', containerId:'shogi', playerSetting:'gpsclient'};
    var controller = new GameController(settings);
    expect(controller.player).not.toBeNull();
  });

});

