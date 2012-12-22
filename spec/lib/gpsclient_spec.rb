require 'pseudo_wave.rb'

  GpsLog = Logger.new('log/gpsclient_spec.log')

  host = '0.0.0.0'
  port = 8081
  tmpState = Wave::State.new( {'status'=>'gpsc', 'mode'=>'playing',
                          'move'=>'+7776FU', 'bid'=> '1', 'count'=>'1',
                          'turn'=>'t', 'board'=> ('1,t,' + Board::Initial_board_string + ',,') ,
                          'next'=>'1,0,77,76,P,f,2:1,1,27,26,P,f,123',
                          'prev'=>'' })
  GpsLog.debug tmpState.toString
  $wave = Wave.new({ :state => tmpState, :host => host, :mode => 'playing',
                     :participants => 'skkmania', :time => 3000,
                     :viewer => 'skphack' } )
  GpsLog.debug $wave.to_s
  
  # $server = EventMachine::WebSocketServer.new(host, port, PseudoWaveConnection)
  # $server.attach(EventMachine::Loop.default)
  GpsLog.debug "start on #{host}:#{port}"
  GpsLog.debug "$wave is  #{$wave.to_s}"
  
$gps_config = { :initial_filename => "bin/csa.init",
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
describe GpsClient, "は初期化されたとき" do
  before(:all) do
    @gpsclient = GpsClient.new($wave, $gps_config, GpsLog)
    @gpsclient.set_master_record "bin/csa.init"
    sleep 2 # wait for program setup
  end

  after(:all) do
    @gpsclient.toryo
    sleep 5 # wait for gpsshogi cooldown
    puts 'toryo done.'
  end

  it "初期化に成功する" do
    @gpsclient.should_not be_nil
  end

  it "のstatus はnilである" do
    @gpsclient.status.should be_nil
  end

  it "のwave プロパティをもつ" do
    @gpsclient.wave.should_not be_nil
  end

  it "のboard プロパティをもつ" do
    @gpsclient.board.should_not be_nil
  end

  it "のboard.storeはupdateされている" do
    @gpsclient.board.store.should_not be_nil
  end
end

describe GpsClient, "のmake_initial_fileをテストする" do
  before(:all) do
    $gps_config[:initial_filename] = nil
    $wave.state['blacks'] = 'abc'
    $wave.state['whites'] = 'gps'
    @gpsclient = GpsClient.new($wave, $gps_config, GpsLog)
    sleep 2 # wait for program setup
  end

  after(:all) do
    @gpsclient.toryo
    sleep 5 # wait for gpsshogi cooldown
    puts 'toryo done.'
  end

  it "fileがつくられる" do
    lambda {
    open($gps_config[:initial_filename]) do |f|
      f.should_not be_nil
    end
    }.should_not raise_error
  end
end

describe GpsClient, "のacceptをテストする" do
  before(:all) do
    @gpsclient = GpsClient.new($wave, $gps_config, GpsLog)
    @gpsclient.set_master_record "bin/csa.init"
    sleep 2 # wait for program setup
    @state = Hash.new
  end

  after(:all) do
    @gpsclient.toryo
    sleep 5 # wait for gpsshogi cooldown
    puts 'toryo done.'
  end

  it "#accept {'move' => '+7776FU' }したあと,自身のboardにその手が反映されている" do
    @state['move'] = "+7776FU"
    @gpsclient.accept @state 
    sleep 2
    @gpsclient.board.get_piece(77).should == 'x'
    @gpsclient.board.get_piece(76).should == 'P'
  end

  it "#accept {'move' => '+2726FU' }したあと,自身のboardにその手が反映されている" do
    @gpsclient.send "+2726FU\n"
    sleep 2
    @gpsclient.board.get_piece(27).should == 'x'
    @gpsclient.board.get_piece(26).should == 'P'
  end


  it "#accept {'move' => '+2625FU' }したあと,自身のboardにその手が反映されている" do
    @gpsclient.send "+2625FU\n"
    sleep 2
    @gpsclient.board.get_piece(26).should == 'x'
    @gpsclient.board.get_piece(25).should == 'P'
  end

end

describe GpsClient, "#to_deltaをテストする" do
  before(:all) do
    $gps_config[:initial_filename] = "bin/csa.init"
    @gpsclient = GpsClient.new($wave, $gps_config, GpsLog)
    @gpsclient.set_master_record "bin/csa.init"
    sleep 2 # wait for program setup
    @state = Hash.new
    @gpsclient.board.store.current_bid = 1
    @gpsclient.board.store.update_store
    @section = @gpsclient.board.store.get_section 2
    puts @section.inspect
  end

  it "返り値はHashであり、'board','next','prev'をkeyに持つ" do
    result = @gpsclient.to_delta @section
    result.class.should == Hash
    result['board'].should_not be_nil
    result['next'].should_not be_nil
    result['prev'].should_not be_nil
    puts result.inspect
  end
end
