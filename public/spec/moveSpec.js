describe("move", function() {

  it("should have from property", function() {
    var move;
    move = new Move('7776Pf');
    expect(move.from).toEqual(77);
  });

});

describe("when object has been transfered", function() {
  var move;

  beforeEach(function() {
    move = new Move('7776Pf');
    move.fromObj({bid:33, mid:3, m_from:33, m_to:34, piece:'p', promote:false, nxt_bid:20 });
  });

  it("should have from property", function() {
    expect(move.from).toEqual(33);
  });

  it("should be converted to CSA form", function() {
    expect(move.toCSA()).toEqual('-3334FU');
  });
});
