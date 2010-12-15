require 'shogi_model.rb'

describe Board, "は初期化されたとき" do
  before(:all) do
    @board = Board.new
  end

  after(:all) do
  end

  it "のboard は初期盤面である" do
    @board.board.should == Board.initial_board_string
    @board.black.should == ''
    @board.white.should == ''
    @board.turn.should be_true
  end

end

describe Board, "はmoveを#applyしたあと" do
  before(:all) do
    @board = Board.new
  end

  after(:all) do
  end

  it "のturn は変化する" do
    lambda{
      @board.apply "+7776FU\n"
    }.should change(@board, :turn)
  end

end
