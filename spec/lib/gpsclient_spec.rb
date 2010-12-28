require 'pseudo_wave.rb'

  host = '0.0.0.0'
  port = 8081
  $wave = Wave.new
  
  $server = Rev::WebSocketServer.new(host, port, PseudoWaveConnection)
  $server.attach(Rev::Loop.default)
  Log.debug "start on #{host}:#{port}"
  
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
GpsLog = Logger.new('log/gpsclient_spec.log')
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

  it "のstatus はnilである" do
    @gpsclient.status.should be_nil
  end

  it "のboard プロパティをもつ" do
    @gpsclient.board.should_not be_nil
  end
  it "のboard.storeはupdateされている" do
    @gpsclient.board.store.should_not be_nil
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
    @gpsclient = GpsClient.new($wave, $gps_config, GpsLog)
    @gpsclient.set_master_record "bin/csa.init"
    sleep 2 # wait for program setup
    @state = Hash.new
    @section = @gpsclient.board.store.get_section 2
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
