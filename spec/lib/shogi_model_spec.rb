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

describe Board, "は初期盤面に'+7776FU\n'を#applyしたあと" do
  before(:all) do
    @board = Board.new
    @board.store.update_store
    @board.apply "+7776FU\n"
  end

  after(:all) do
  end

  it "のturn はfalseになる" do
    @board.turn.should == false
  end
  it "の76のpieceは'P'になる" do
    @board.get_piece(76).should == 'P'
  end
  it "の77のpieceは'x'になる" do
    @board.get_piece(77).should == 'x'
  end
end

describe Board, "は初期盤面に'+7776FU\n-3334FU\n+8822UM\n'を#applyしたあと" do
  before(:all) do
    @board = Board.new
    @board.store.update_store
    @res = @board.apply "+7776FU\n"
    @res = @board.apply "-3334FU\n"
    @res = @board.apply "+2726FU\n"
  end

  after(:all) do
  end

  it "のturn はfalseになる" do
    @board.turn.should == false
  end
  it "の76のpieceは'P'になる" do
    @board.get_piece(76).should == 'P'
  end
  it "の77のpieceは'x'になる" do
    @board.get_piece(77).should == 'x'
  end
  it "の34のpieceは'p'になる" do
    @board.get_piece(34).should == 'p'
  end
  it "の33のpieceは'x'になる" do
    @board.get_piece(33).should == 'x'
  end
  it "の27のpieceは'x'になる" do
    @board.get_piece(27).should == 'x'
  end
  it "の26のpieceは'P'になる" do
    @board.get_piece(26).should == 'P'
  end

  it "返り値のHashにはdeltaの種のデータがはいっている" do
    @res['board'].size >= 1
    @res['prev'].size >= 1
    @res['next'].size >= 0
  end
end

describe Move, "のpromoteをテストする" do
  it "pのpromoteは" do
    m = Move.new [77, 76, 'p', true]
    m.promoted_piece.should == 'q'
  end
  it "Pのpromoteは" do
    m = Move.new [77, 76, 'P', true]
    m.promoted_piece.should == 'Q'
  end
end

describe Move, "は初期盤面とcsa形式文字列を与えられると" do
  before do
    @board = Board.new
    @move  = Move.new
  end
  it "'+7776FU'に対して" do
    @move.parse_csa(@board, '+7776FU')
    @move.should == {:bid => 1, :turn => true,
       :m_from => 77, :m_to => 76, :piece => 'P', :promote => false }
  end
  it "'-3334FU'に対して" do
    @move.parse_csa(@board, '-3334FU')
    @move.should == {:bid => 1, :turn => false,
       :m_from => 33, :m_to => 34, :piece => 'p', :promote => false }
  end
  it "'+2822RY'に対して" do
    @move.parse_csa(@board, '+2822RY')
    @move.should == {:bid => 1, :turn => true,
       :m_from => 28, :m_to => 22, :piece => 'R', :promote => true }
  end
  it "'+9993KY'に対して" do
    @move.parse_csa(@board, '+9993KY')
    @move.should == {:bid => 1, :turn => true,
       :m_from => 99, :m_to => 93, :piece => 'L', :promote => false }
  end
end
