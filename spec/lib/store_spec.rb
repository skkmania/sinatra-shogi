# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  store_spec.rb
#
#require 'lib/store.rb'
require 'pseudo_wave.rb'

SpecLog = Logger.new('log/store_spec.log')
describe Store, 'は初期化したとき' do
  before do
    @store = Store.new(SpecLog)
  end

  it "DbAccessor をプロパティとして持つ" do
    @store.dba.should_not be_nil
  end

  it "current_bid が1である" do
    @store.current_bid.should == 1
  end
end

describe Store, "はfrom_state にboard,next,prevがそろったstate をわたされたとき" do
  before(:all) do
    @store = Store.new(SpecLog)
    @state = Wave::State.new
    @state['board'] = '1,t,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL,,'
    @state['next']='1,4,17,16,P,f,10394:1,5,97,96,P,t,10398:1,6,67,66,P,f,10454'
    @state['prev']='235,0,57,56,P,f,232:1629,0,77,76,P,f,232'
  end
  it "それぞれの要素を自身にとりこむ" do
    @store.from_state @state
    @store['board'].should include({:bid=>1,:turn=>true,:board=>'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL',:black=>'',:white=>''})
    @store['nextMoves'].should include({:bid=>1,:mid=>5,:m_from=>97,:m_to=>96,:piece=>'P',:promote=>true,:nxt_bid=>10398})
    @store['prevMoves'].should include({:bid=>235,:mid=>0,:m_from=>57,:m_to=>56,:piece=>'P',:promote=>false,:nxt_bid=>232})
  end
end

describe Store, "は#state_str_to_hash state, name を実行したとき" do
  before(:all) do
    @store = Store.new(SpecLog)
    @state = Wave::State.new
    @state['board'] = '1,t,lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL,,'
    @state['next']='1,4,17,16,P,f,10394:1,5,97,96,P,t,10398:1,6,67,66,P,f,10454'
    @state['prev']='235,0,57,56,P,f,232:1629,0,77,76,P,f,232'
  end
  it "boardのとき" do
    @store.state_str_to_hash(@state, 'board').should == [{:bid=>1,:turn=>true,:board=>'lxpxxxPxLnbpxxxPRNsxpxxxPxSgxpxxxPxGkxpxxxPxKgxpxxxPxGsxpxxxPxSnrpxxxPBNlxpxxxPxL',:black=>'',:white=>''}]
  end
  it "nextのとき" do
    result = @store.state_str_to_hash(@state, 'next')
    result.should have(3).moves
    result.should include({:bid=>1,:mid=>5,:m_from=>97,:m_to=>96,:piece=>'P',:promote=>true,:nxt_bid=>10398})
  end
  it "prevのとき" do
    result = @store.state_str_to_hash(@state, 'prev')
    result.should have(2).moves
    result.should include({:bid=>235,:mid=>0,:m_from=>57,:m_to=>56,:piece=>'P',:promote=>false,:nxt_bid=>232})
  end
end

describe Store, "は#update_store を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @store.update_store
  end
  it "board, nextMoves, prevMoves 各キーの値を持つ" do
    @store['board'].size.should >= 1
    @store['nextMoves'].size.should >= 1
    @store['prevMoves'].size.should >= 1
  end
end

describe Store, "は#read_from_db を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @dummy = {1 => {}, 2 => {}}
  end
  it "サイズが変わる" do
    lambda {
      @store.read_from_db @dummy
    }.should change(@store, :size)
  end
end

describe Store, "は#complement を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @store.update_store
    @move = Move.new [77,76,'P',false]
    @move[:bid] = 1
    @board = Board.new
    @board, @move = @store.complement @board, @move
  end
  it "返り値@moveはmid,nxt_bid 各キーの値を持つ" do
    @move[:mid].size.should >= 1
    @move[:nxt_bid].size.should >= 1
  end
  it "Storeには渡したmoveのnxt_bidのsectionが存在する" do
    # complementしたあとは必ず新しい盤面のsectionが存在することをテストしたい。
    # しかしここでは+7776FUに対してのみのテストになってしまっている。
    # 本当はStoreに情報が足りずにupdateしにいくケースのテストをしなければならないのだが。
    @store.get_section(@move[:nxt_bid])['bid'].should == @move[:nxt_bid]
    @store.get_section(@move[:nxt_bid])['board'].size.should == 1
    @store.get_section(@move[:nxt_bid])['next'].size.should >= 0
    @store.get_section(@move[:nxt_bid])['prev'].size.should >= 1
  end
end

describe Store, "complementのテスト：Storeに情報が足りずにfind_moveがnilを返すケース" do
  before(:all) do
    @move = Move.new
    @board = Board.new
    @store = Store.new
    @store['board'] = []
    @store['prevMoves'] = []
  end


  it "DBに触らないためにupdate_storeもregist_boardもstubで対応するテスト" do
    @store.stub!(:find_move).with(@move).and_return(nil)
    @store.stub!(:update_store).and_return(nil)
    @store.dba.stub!(:regist_board).and_return({'board'=>[{:bid=>10,:board=>''}],'nextMoves'=>[],'prevMoves'=>[@move]})
    @store.dba.stub!(:log_format).and_return('spec test mock')
    res_board, res_move = @store.complement(@board,@move)
    res_board.black.should == ''
  end
end

=begin
 # 本当はStoreに情報が足りずにupdateしにいくケースのテストをしなければならないのだが。DBのテストにもなってしまうので準備が必要
 # このテストの実施案
describe Store, "は#complement を実行したとき" do
  before(:all) do
    @store.current_bid = 10000 # なにか小さいStoreがとれるbidを指定
    そのbidにて存在するmoveとboardをテストのために消す
    @move = そのmoveをリテラルで生成しておく
    @board = そのbidのboardをリテラルで生成しておく
    @store = Store.new(SpecLog)
    @store.update_store
    @moveは@storeにはないはず
    @result = complement @board, @move  #  テスト対象コード
  end
  # 結果について検証
  it "complementをstoreに存在しないmoveとboardを指定されて実行すると返り値はそのmoveとboardの完全情報をそなえている" do
    #@board, @moveのkey, valueが型まで完備することを確認するコード
    @result[0][:bid].should == 
    @result[0][:bid].class.should == Fixnum
  end
  it "complementをstoreに存在しないmoveとboardを指定されて実行するとDBに登録する" do
    DBに@board, @moveが存在することを確認するコード
  end
  it "さらに、
end
=end

describe Store, "は#get_section 1 を実行したとき" do
  before do
    @store = Store.new(SpecLog)
    @store.update_store
    @move = Move.new [77,76,'P',false]
    @result = @store.get_section 1
  end
  it "返り値resultはbid,board,next,prev 各キーの値を持つ" do
    @result['bid'].should == 1
    @result['board'][0][:board].should == Board.initial_board_string
    @result['next'].size.should >= 1
    @result['prev'].size.should == 0
  end
end

describe Store, "find_moveのテスト" do
  before(:all) do
    @store = Store.new(SpecLog)
    @store.update_store
  end

  it "storeにある指し手を探したときは、その指し手の全情報を返す" do
    @move = Move.new [77,76,'P',false]
    @move[:bid] = 1
    result = @store.find_move @move
    result[:bid].should == 1
    result[:mid].should == 0
    result[:m_from].should == 77
    result[:m_to].should == 76
    result[:piece].should == 'P'
    result[:promote].should == false
    result[:nxt_bid].should == 2
  end

  it "storeにない指し手を探したときは、ないということを返す" do
    @move = Move.new [77,76,'P',false]
    @move[:bid] = 2
    result = @store.find_move @move
    result.should be_nil
  end
end
