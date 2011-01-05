require 'shogi_model.rb'

SpecLog = Logger.new('log/shogi_model_spec.log')
describe Board, "は初期化されたとき" do
  before(:all) do
    @board = Board.new(SpecLog)
  end

  after(:all) do
  end

  it "のboard は初期盤面である" do
    @board.board.should == Board.initial_board_string
    @board.black.should == ''
    @board.white.should == ''
    @board.turn.should be_true
  end

  it "to_logによりlog file出力用の文字列へ変換できる" do
    result = @board.to_log
    result.should match(/bid:\d+, turn:/)
    SpecLog.debug(result)
  end
end

# applyのテスト
#  返り値の正しさのテスト
describe Board, "のapplyをテストする" do
  before(:all) do
    @board = Board.new
    @board.store.update_store
    SpecLog.debug(@board.to_log)
    @result = @board.apply "+7776FU\n"
    SpecLog.debug(@board.to_log)
  end
  it "その返り値 はHashである" do
    @result.class.should == Hash
  end
  it "その返り値はkeyとして board, next, prev をもつ" do
    @result.keys.should include('board')
    @result.keys.should include('next')
    @result.keys.should include('prev')
  end
  it "初期盤面に'+7776FU\n'を#applyしたあとの返り値のboardの値は" do
    @result['board'].should == [{:bid=>2, :black=>"", :white=>"",
                                :turn=>false,
      :board=>"lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL"}]
  end
  it "初期盤面に'+7776FU\n'を#applyしたあとの返り値のnextの値は" do
    @result['next'].should ==  [{:bid=>2, :m_from=>33, :m_to=>34, :piece=>"p", :nxt_bid=>3, :promote=>false, :mid=>0}, {:bid=>2, :m_from=>83, :m_to=>84, :piece=>"p", :nxt_bid=>235, :promote=>false, :mid=>1}, {:bid=>2, :m_from=>53, :m_to=>54, :piece=>"p", :nxt_bid=>14817, :promote=>false, :mid=>2}, {:bid=>2, :m_from=>13, :m_to=>14, :piece=>"p", :nxt_bid=>10647, :promote=>false, :mid=>3}]
  end
  it "初期盤面に'+7776FU\n'を#applyしたあとの返り値のprevの値は" do
    @result['prev'].should == [{:bid=>1, :mid=>0, :m_from=>77, :m_to=>76, :piece=>"P", :nxt_bid=>2, :promote=>false}] 
  end
end

# applyのテスト
#   Boardオブジェクトのプロパティの正当性のテスト
describe Board, "の#applyしたあとの@turnプロパティのテストをする" do
  before(:all) do
    @board = Board.new
    @board.store.update_store
  end

  after(:all) do
  end

  it "先手の指し手の後の@turn はfalseになる" do
    @board.apply "+7776FU\n"
    @board.turn.should == false
  end
  it "@bidは更新された盤面のbidになる" do
    @board.bid.should == 2
  end
  it "後手の指し手の後の@turn はtrueになる" do
    @board.apply "-3334FU\n"
    @board.turn.should == true
  end
end

# applyのテスト
#   駒の動きが盤面に反映されることのテスト
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

describe Move, "parse_csaのテスト" do
  before(:all) do
    @board = Board.new
    @board.from_ary %w|100 f NNP lxxpxxxxLnxpxPxRxxxgxpxPxxbxxpxsPSxxrxxkpxxxxxgxpxGxxxxxxpxPxGxxxxLpxPSKxxHpxxPxL snpp|
    @move  = Move.new
  end
  
  it "'-0045FU'に対して" do
    @move.parse_csa(@board, '-0045FU')
    @move.should == {:bid => 100, :turn => false,
       :m_from => 0, :m_to => 45, :piece => 'p', :promote => false }
  end

  it "'+0045FU'に対して,turnがあわないので例外が発生する" do
    lambda{ @move.parse_csa(@board, '+0045FU')
    }.should raise_error(ParseCSAException)
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
    @board.turn = false
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

describe Move, "to_logのテスト" do
  before do
    @board = Board.new
    @move  = Move.new
  end
  it "'+7776FU'に対して" do
    @move.parse_csa(@board, '+7776FU')
    @move.to_log.should == 'move : 1, , true, 77, 76, P, false, , '
  end
end
