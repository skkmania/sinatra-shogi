var testcases = {
  setup : function()  {  with( this )  {
  } },
  teardown : function()  {  with( this )  {
    /* ..... テストの後処理(省略) ..... */
  } },
  testKanji : function() {  with( this )  {
    var num = 1;
    assertEqual( '一', num.toKanji() );
  } },
  testCellAfterMove : function() {  with( this )  {
    // Pieceのmoveのテスト
    var fromCell = game.board.cells[2][3];
    var toCell = game.board.cells[2][2];
    var storedPiece = fromCell.piece;
    try  {
      fromCell.piece.move(fromCell, toCell, false, false);
    }  catch( e )  {
    }
    // 駒が動いた後のセルの状態をテスト
    assertNull(fromCell.piece); 
    assertIdentical(storedPiece, toCell.piece);
  } }
};
//new Test.Unit.Runner( testcases, 'testlog' );


