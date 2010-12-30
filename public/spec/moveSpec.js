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

describe("toCSA$B$N%F%9%H(B", function() {
  var move;

  beforeEach(function() {
    move = new Move('7776Pf');
  });

  it("$B@h<j$N6p(B", function() {
    move.fromObj({bid:1, mid:0, m_from:77, m_to:76, piece:'P', promote:false, nxt_bid:20 });
    expect(move.toCSA()).toEqual('+7776FU');
  });

  it("$B8e<j$N6p(B", function() {
    move.fromObj({bid:33, mid:3, m_from:33, m_to:34, piece:'p', promote:false, nxt_bid:20 });
    expect(move.toCSA()).toEqual('-3334FU');
  });
});
