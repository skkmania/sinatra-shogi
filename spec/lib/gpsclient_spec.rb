require 'pseudo_wave.rb'

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
             :base_command => 'bin/gpsshogi -v -c'
           }
GpsLog = Logger.new('log/gpsclient_spec.log')

describe GpsClient, "は初期化されたとき" do
  before(:all) do
    @gpsclient = GpsClient.new($wave, $gps_config, GpsLog)
  end

  after(:all) do
    @gpsclient.toryo
    sleep 1
    puts 'toryo done.'
  end

  it "のstatus はnilである" do
    @gpsclient.status.should be_nil
  end

  it "のboard プロパティをもつ" do
    @gpsclient.board.should_not be_nil
  end
end

describe GpsClient, "は#make_deltaしたあと" do
end

describe GpsClient, "はバイナリに対して#sendしたあと" do
  before(:all) do
    @gpsclient = GpsClient.new($wave, $gps_config, GpsLog)
    sleep 1
    @gpsclient.send "+7776FU\n"
    sleep 1
  end

  after(:all) do
    @gpsclient.toryo
    sleep 1
    puts 'toryo done.'
  end

  it "のstatus はsent_to_binaryである" do
    @gpsclient.status.should == 'sent_to_binary'
  end

  it "gpsclientからのレスポンスを読んでいる" do
    @gpsclient.status.should == 'delta_sent'
  end

  it "再度バイナリに対して#sendしたあと" do
    @gpsclient.send "+7675FU\n"
    sleep 1
    @gpsclient.status.should == 'sent_to_binary'
    sleep 3
  end

  it "gpsclientからのレスポンスを読んでいる" do
    @gpsclient.status.should == 'delta_sent'
  end
end
