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

describe Move, "はcsa形式文字列を与えられると" do
  before(:all) do
    @board = Board.new
  end
  before do
    @move  = Move.new
  end
  it "'+7776FU'に対して" do
    @move.parse_csa(@board, '+7776FU')
    @move.should == {:turn => true,
       :m_from => 77, :m_to => 76, :piece => 'P', :promote => false }
  end
  it "'-3334FU'に対して" do
    @move.parse_csa(@board, '-3334FU')
    @move.should == {:turn => false,
       :m_from => 33, :m_to => 34, :piece => 'p', :promote => false }
  end
  it "'+2822RY'に対して" do
    @move.parse_csa(@board, '+2822RY')
    @move.should == {:turn => true,
       :m_from => 28, :m_to => 22, :piece => 'R', :promote => true }
  end
  it "'+9993KY'に対して" do
    @move.parse_csa(@board, '+9993KY')
    @move.should == {:turn => true,
       :m_from => 99, :m_to => 93, :piece => 'L', :promote => false }
  end
end
