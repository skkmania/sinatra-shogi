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

# from_stateのテスト
describe Board, "のfrom_stateをテストする" do
  before(:all) do
    @board = Board.new
    SpecLog.debug(@board.to_log)
  end
  it "持駒がないとき、各プロパティの値が定まる" do
    state = {'bid'=>1, 'turn'=>'true', 'board'=>'1,t,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL,,'}
    @board.from_state state
    @board.bid.should == 1
    @board.turn.should == true
    @board.board.should == 'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL'
    @board.black.should == ''
    @board.white.should == ''
  end
  it "先手だけ持駒があるとき、各プロパティの値が定まる" do
    state = {'bid'=>101, 'turn'=>'true', 'board'=>'101,t,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL,pp,'}
    @board.from_state state
    @board.bid.should == 101
    @board.turn.should == true
    @board.board.should == 'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL'
    @board.black.should == 'pp'
    @board.white.should == ''
  end
  it "後手だけ持駒があるとき、各プロパティの値が定まる" do
    state = {'bid'=>100, 'turn'=>'false', 'board'=>'100,f,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL,,pp'}
    @board.from_state state
    @board.bid.should == 100
    @board.turn.should == false
    @board.board.should == 'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL'
    @board.black.should == ''
    @board.white.should == 'pp'
  end
  it "両方に持駒があるとき、各プロパティの値が定まる" do
    state = {'bid'=>100, 'turn'=>'false', 'board'=>'100,f,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL,PP,pp'}
    @board.from_state state
    @board.bid.should == 100
    @board.turn.should == false
    @board.board.should == 'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrpxxxPBNlxpxxxPxL'
    @board.black.should == 'PP'
    @board.white.should == 'pp'
  end
end

# to_csa_fileのテスト
describe Board, "のto_csa_fileをテストする" do
  before(:all) do
    @board = Board.new
    @board.store.update_store
    SpecLog.debug(@board.to_log)
    @result = @board.apply "+7776FU\n"
    SpecLog.debug(@board.to_log)
@wanted=<<END
N+abc
N-gps
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY
P2 * -HI *  *  *  *  * -KA * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  * +FU *  *  *  *  *  * 
P7+FU+FU * +FU+FU+FU+FU+FU+FU
P8 * +KA *  *  *  *  * +HI * 
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
-
END
  end
  
  it "'+7776FU'のあとの局面のとき、その返り値は#{@wanted}である" do
    @board.to_csa_file(['abc','gps']).should == @wanted
  end

  it "持駒の処理のテスト" do
    @board.from_ary %w|100 f NNP lxxpxxxxLnxpxPxRxxxgxpxPxxbxxpxsPSxxrxxkpxxxxxgxpxGxxxxxxpxPxGxxxxLpxPSKxxHpxxPxL snpp|
@wanted2=<<END2
N+abc
N-gps
P1 *  *  *  * -HI *  * -KE-KY
P2 *  *  * -KI *  * -KI *  * 
P3+UM *  *  *  * -FU * -FU * 
P4-FU+KY-FU-FU-OU * -FU * -FU
P5 * -FU *  * -FU-GI * +FU * 
P6 *  * +FU+KI * +FU+FU *  * 
P7+FU+FU *  *  * +GI * +HI * 
P8 * +GI+KI *  *  *  *  *  * 
P9+KY+OU *  *  *  * -KA * +KY
P+00KE00KE00FU
P-00GI00KE00FU00FU
-
END2
    @board.to_csa_file(['abc','gps']).should == @wanted2
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
    @result['next'].should ==  [{:bid=>2, :m_from=>33, :m_to=>34, :piece=>"p", :nxt_bid=>3, :promote=>false, :mid=>0}, {:bid=>2, :m_from=>83, :m_to=>84, :piece=>"p", :nxt_bid=>235, :promote=>false, :mid=>1}, {:bid=>2, :m_from=>53, :m_to=>54, :piece=>"p", :nxt_bid=>14817, :promote=>false, :mid=>2}, {:bid=>2, :m_from=>13, :m_to=>14, :piece=>"p", :nxt_bid=>10647, :promote=>false, :mid=>3}, {:mid=>4, :m_from=>11, :m_to=>12, :piece=>"l", :nxt_bid=>15077, :promote=>false, :bid=>2}]
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

# _applyのテスト
describe Board, "駒をとる動きが盤面と持駒に反映されることのテスト" do
  before(:all) do
    @board = Board.new
    @board.from_ary %w|100 f NNP lxxpxxxxLnxpxPxRxxxgxpxPxxbxxpxsPSxxrxxkpxxxxxgxpxGxxxxxxpxPxGxxxxLpxPSKxxHpxxPxL snpp|
    @move = Move.new
    @move.parse_csa @board, "-3966KA\n"
    @res = @board._apply @move
  end
  it "後手が39の角で66の金をとると後手の駒台に金が増える" do
    @board.white.should == 'snppg'
  end
  it "後手が39の角で66の金をとると39は空になる" do
    @board.get_piece(39).should == 'x'
  end
  it "後手が39の角で66の金をとると66は角になる" do
    @board.get_piece(66).should == 'b'
  end
end

# _applyのテスト
describe Board, "成り駒をとる動きが盤面と持駒に反映されることのテスト" do
  before(:all) do
    @board = Board.new
    @board.from_ary "14848|f|B|lxpxxxPxLnHpxxPxRNsxxpxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxPxxSnrxpxxPxNlxpxxxPxL|".split('|',-1) 
    @move = Move.new
    @move.parse_csa @board, "-3122GI\n"
    @res = @board._apply @move
  end
  it "後手が31の銀で22の馬をとると後手の駒台に角が増える" do
    @board.white.should == 'b'
  end
  it "後手が31の銀で22の馬をとると31は空になる" do
    @board.get_piece(31).should == 'x'
  end
  it "後手が31の銀で22の馬をとると22は銀になる" do
    @board.get_piece(22).should == 's'
  end
end

# _applyのテスト
describe Board, "駒を打つ動きが盤面と持駒に反映されることのテスト" do
  before(:all) do
    @board = Board.new
    @board.from_ary %w|100 f NNP lxxpxxxxLnxpxPxRxxxgxpxPxxbxxpxsPSxxrxxkpxxxxxgxpxGxxxxxxpxPxGxxxxLpxPSKxxHpxxPxL snpp|
    @move = Move.new
    @move.parse_csa @board, "-0015GI\n"
    @res = @board._apply @move
  end
  it "後手が15に銀を打つと後手の駒台から銀が減る" do
    @board.white.should == 'npp'
  end
  it "後手が15に銀を打つと15は銀になる" do
    @board.get_piece(15).should == 's'
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

describe Move, "parse_csaのテスト2" do
  before(:all) do
    @board = Board.new
    @board.from_ary %w|100 f PPNN lxpxxPxxLxxpbxxxxRksxxxpxKxgxxpsxPSxxgpxxgxPxxrxxxxPSxxxxpxPxGxnxxxxPxBNlxpxxxPxL pp|
    @move  = Move.new
  end
  
  it "'-0066FU'に対して" do
    @move.parse_csa(@board, '-0066FU')
    @move.should == {:bid => 100, :turn => false,
       :m_from => 0, :m_to => 66, :piece => 'p', :promote => false }
  end

  it "'+0066FU'に対して,turnがあわないので例外が発生する" do
    lambda{ @move.parse_csa(@board, '+0066FU')
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
