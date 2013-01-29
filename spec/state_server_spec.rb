# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  pseudo_wave_spec.rb
#
require '/home/skkmania/workspace/sinatra/shogi/state_server.rb'
require 'spec_helper.rb'

SpecLog = Logger.new('log/state_server_spec.log')
  
$gps_config = {
	:initial_filename => "bin/csa.init",
	:opponent => "skkmania",
	:sente => false,
	:black => "skkmania", 
	:white => "gps",
	:limit => 1600, 
	:table_size => 30000,
	:table_record_limit => 50,
	:node_limit => 16000000,
	:timeleft => 100, 
	:byoyomi => 60,
	:logfile_basename => "bin/logs/x1_",
	:other_options => "",
	:base_command => 'bin/gpsshogi -v -r -c' # random play for test
}

#
#  StateModule
#
describe StateModule do
  let (:Log) { double :logger }

  class DummyClass; end

  before(:all) do
    @dummy = DummyClass.new
    @dummy.extend StateModule
  end

  #
  #  StateModule#readStatus
  #
  describe "#readStatus?" do
    it "dataを受け取るとハッシュ構造を理解する"
    it "理解したハッシュからstatus key の値を読んでかえす"
    it "理解したハッシュにstatus keyがなければ例外を発行する"
  end
	  
  #
  #  StateModule#loginMessage
  #
  describe "#loginMessage?" do
    it '受信したメッセージがログイン要求ならば真である' do
      @dummy.loginMessage?('sync|wave').should be_true
    end

    it '受信したメッセージがログイン要求でないならば偽である' do
      @dummy.loginMessage?('not_login_request').should_not be_true
    end
  end

  #
  #  StateModule#sendBroadcast
  #
  describe "#sendBroadcast" do
    shared_context 'clientが存在する' do
      before do
	@dummy.connected_clients[0] = 'a'
	@dummy.connected_clients[1] = 'b'
      end
    end
      
	  
    context "長さ0のmessageをうけとったとき" do
      it "そのむねをerrorとしてlogに記す" do
        Log.should_receive(:error).with "StateModule#sendBroadcast : empty message has arrived."
        @dummy.sendBroadcast('')	   
      end

      it "どのクライアントにも送信せずreturnする" do
	# any in connected_clients should_not_receive(:send)  みたいに書けるか?
        @dummy.sendBroadcast('')	   
      end	

    end

    context "長さのあるmessageをうけとったとき" do
      include_context 'clientが存在する'
      let(:message) { "sample message" }
      let(:response) { "sent to all : sample message" }

      it "接続ユーザー全員にメッセージを送る" do
	@dummy.connected_clients.each{|c|
	  c.should_receive(:send).with(message)
	}
        @dummy.sendBroadcast(message)	   
      end	
      it "接続ユーザー全員にメッセージを1回送る" do
	# all in connected_clients should__receive(:send).once  みたいに書けるか?
        @dummy.sendBroadcast('test message')	   
      end	
      it "送付したことをmessageとともにlogに記す" do
        Log.should_receive(:debug).with response
        @dummy.sendBroadcast(message)	   
      end
      
    end

  end

  #
  #  StateModule#login
  #
  describe "#loginは" do

    context "同じ名前のuserからLOGINリクエストがきたら" do
      it "拒否する"
        # 拒否されたほうの検証
      end
      it "@@connected_clientsの要素がひとつ増える" do
        expect{ @dummy.login }.to change{ @dummy.g.size }.by(1)
      end
    end

    context "新しいuserからLOGINリクエストがきたら" do
      it "@@connected_clientsの要素がひとつ増える" do
        expect{ @dummy.login }.to change{ @dummy.g.size }.by(1)
      end
    end

  end

  #
  #  StateModule#logout
  #
  describe "#logoutは" do

    it "@@connected_clientsから要素がひとつ減る" do
      expect{ @dummy.logout }.to change{ @dummy.g.size }.by(-1)
    end
    it "#bad_method" do 
	      expect{ subject.bad_method }.to raise_error(NoMethodError)
    end

  end

  #
  #  StateModule#toString
  #
  describe "#toString" do
    it " "
  end

  #
  #  StateModule#submitDelta
  #
  describe "#submitDelta" do
    it " "
  end


#
#  main programme
#
describe "main" do
  describe "onopen" do
    it "loginを促すメッセージが送られる" do
      EM.run {
	main
	test_client = EM.connect("0.0.0.0", 8081, FakeSocketClient)
	test_client.onopen = lambda {
          socket.data.last.chomp.should == "Welcome! Please login!"
	  EM.stop
	}
      }
    end
  end

  describe "onmessage" do
    it "messageからstatusを読みとる" do
      EM.run {
	main
	test_client = EM.connect("0.0.0.0", 8081, FakeSocketClient)
	test_client.send_data("sync|")
	test_client.onmessage = lambda {|data|
          data.chomp.should == "sync|"
	  EM.stop
	}
      }
    end
  end

  context "onmessageのうけとったstatusの値が" do
    context "正常値" do
      describe "syncのとき" do
	it "受け取ったdataをそのままbroadcastする"
	it "logにその旨を記述する"
      end
      describe "reset のとき" do
	it "serverが保持しているstateをクリアする"
	it "stateがクリアされたことをbroadcastする"
	it "stateがクリアされたことをlogに記録する"
      end
      describe "gpss のとき" do
	it "gps対局を申し込まれたことをlogに記録する"
	it "GpsClientをsetupする"
	it "serverが保持しているstateのstatusをgpscにする"
	it "serverが保持しているstateのmodeをplayingにする"
	it "setupしたGpsClientをキックする"
	it "setupしたGpsClientをキックしたことをlogに記録する"
      end
      describe "toryo のとき" do
        # gps対局中にユーザから投了された
	it "GpsClientにtoryoを伝達する"
	it "serverが保持しているstateをクリアする"
	it "stateがクリアされたことをbroadcastする"
	it "ユーザが投了してstateがクリアされたことをlogに記録する"
      end
      describe "gpsc のとき" do
	it "まず受け取ったdataをそのままbroadcastする"
        it "それからgpsclientにstate(指し手情報を含む)を渡す"
      end
    end
    context "異常値" do
      describe "その他 のとき" do
        # expect Exception
      end
    end
  end

  context "onclose" do
  end

  context "onerror" do
    it do
      pending("error の定義をしなければ")
      expect { }.to raise_error
    end
  end
end

# -------------------------------------
# 以下は参考に残しただけ
=begin

describe PubSub, 'のsubscribeメソッドは' do

  it 'blockを受け取る。' do
    ps = PubSub.new
    ps.subscribe{|data| dummy = 0 }
  end

  it 'block以外のものを受け取ると例外が発生する' do
  end

  it 'blockを受け取ると、@seqidが + 1 される。' do
  end

  it 'blockを受け取ると、@subscriberに格納される。' do
  end

  it 'blockを受け取ると、そのblockを管理するkeyを返す。' do
  end
end

describe PubSub, 'のunsubscribeメソッドは' do

  it '正の整数を受け取る。' do
    ps = PubSub.new
    ps.unsubscribe(3)
  end

  it '正の整数以外のものを受け取ると例外が発生する' do
  end

  it 'blockを受け取ると、@seqidが + 1 される。' do
  end

  it 'blockを受け取ると、@subscriberに格納される。' do
  end

  it 'blockを受け取ると、そのblockを管理するkeyを返す。' do
  end
end

#
#  PseudoWaveConnection
#
describe PseudoWaveConnection, 'は初期化でon_openが呼ばれたとき' do
  before(:all) do
    host = '0.0.0.0'
    port = 8081
    tmpState = Wave::State.new(
         {'status'=>'gpsc', 'mode'=>'playing',
          'move'=>'+7776FU', 'bid'=> 1, 'count'=>'1', 'turn'=>'t',
          'board'=> ('1,t,' + Board::Initial_board_string + ',,') ,
          'next'=>'1,0,77,76,P,f,2:1,1,27,26,P,f,123',
          'prev'=>'' })
    $wave = Wave.new({ :state => tmpState, :host => host,
                       :mode => 'playing',
                       :participants => 'skkmania', :time => 3000,
                       :viewer => 'skphack' } )
    $gpsclient = GpsClient.new($wave, $gps_config, SpecLog)
    
    # $server = EventMachine::WebSocketServer.new(host, port, PseudoWaveConnection)
    # $server.attach(EventMachine::Loop.default)
    
    SpecLog.debug "start on #{host}:#{port}"
  end

  after(:all) do
    $server.close
  end

  it "current_bid が1である" do
    $gpsclient.board.store.current_bid.should == 1
    SpecLog.debug "current_bid == 1, ok"
  end
end

describe Wave::State, '文字列受け入れテスト' do
  it "空文字列を渡されると空のStateになる" do
    Wave::State.new.fromString('').should == {}
  end
  it "|がkeyとvalueを区切るので'key|value'は要素がひとつのStateをつくる" do
    Wave::State.new.fromString('key|value').should == {'key' => 'value'}
  end  
  it "!!が要素を区切るので'key1|value1!!key2|value2'は要素がふたつのStateをつくる" do
    Wave::State.new.fromString('key1|value1!!key2|value2').should == {'key1' => 'value1', 'key2' => 'value2'}
  end  
end
describe Wave::State, 'toStateのテスト' do
  before(:all) do
    $wave = Wave.new
    @state = $wave.state
    $gpsclient = GpsClient.new($wave, $gps_config)
  end  
  it "bid = 10 のsectionをStateに載せると" do
    @section = $gpsclient.board.store.get_section 10
    @state.merge! @section
    puts @state.inspect
  end
end
=end
