# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  util_spec.rb
#
require 'logger'
require 'lib/util.rb'

SpecLog = Logger.new('log/util_spec.log')

describe 'utilのテスト' do
  before(:all) do
    @state_sample_mini = {'status'=>'gpsc', 'mode'=>'playing',
                          'move'=>'+7776FU', 'bid'=> '1', 'count'=>'1',
                          'turn'=>'t', 'board'=>'1,t,lbpxxp,,',
                          'next'=>'1,0,77,76,P,f,2:1,1,27,26,P,f,123',
                          'prev'=>'' }
    @state_sample_diff = {'players'=>'abc,gps', 'blacks'=>'abc',
                          'whites'=>'gps'}
    @state_sample_full = @state_sample_mini.merge @state_sample_diff
  end

  it "state_log_formatに空のHashを渡すと空文字列がかえる" do
    state_log_format({}).should == ''
  end

  it "state_log_formatにoption 'full'を渡すとstate全体の文字列がかえる" do
    result = state_log_format(@state_sample_full,'full')
    result.split("\n").should have(@state_sample_full.size).rows
    puts result
  end

  it "state_log_formatにoption を渡さないとstateの一部の文字列がかえる" do
    result = state_log_format(@state_sample_full)
    result.split("\n").should have(@state_sample_mini.size).rows
    puts result
  end
end
