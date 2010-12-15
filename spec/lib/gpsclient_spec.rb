require 'gpsclient.rb'

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

describe GpsClient, "は初期化されたとき" do
  before(:all) do
    @gpsclient = GpsClient.new($gps_config)
  end

  after(:all) do
    @gpsclient.toryo
    sleep 1
    puts 'toryo done.'
  end

  it "のstatus はnilである" do
    @gpsclient.status.should be_nil
  end

  it "のstore プロパティをもつ" do
    @gpsclient.store.should_not be_nil
  end
end

describe GpsClient, "は#sendしたあと" do
  before(:all) do
    @gpsclient = GpsClient.new($gps_config)
    sleep 1
    @gpsclient.send "+7776FU\n"
    sleep 1
  end

  after(:all) do
    @gpsclient.toryo
    sleep 1
    puts 'toryo done.'
  end

  it "のstatus はsentである" do
    @gpsclient.status.should == 'sent'
  end

  it "gpsclientからのレスポンスを読むことができる" do
    res = @gpsclient.read
    puts res
    res.should_not be_nil
  end
end
