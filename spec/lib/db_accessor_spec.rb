# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  db_accessor_spec.rb
#
#require 'lib/db_accessor.rb'
require 'pseudo_wave.rb'

# test用パラメータ
SpecParam = {
  'bid'   => 1,
  'uid'   => 1,
  'mask'  => 7,
  'level' => 3,
  'range' => 'full' }

# test用Logger
SpecLog = Logger.new('log/db_accessor_spec.log')

# test用utility
  def delete_board(b)
    query = "delete from boards where board = '#{b['board']}' \
             and white = '#{b['white']}' and black = '#{b['black']}' and turn = '#{b['turn']}'"
    DB[query].all
  end

  def delete_move(m)
    query = "delete from moves where bid = #{m['bid']} and \
             m_from = #{m['from']} and m_to = #{m['to']} and \
             piece = '#{m['piece']}' and promote = '#{m['promote']}'"
    DB[query].all
  end

# 各Spec
describe DbAccessor, 'は初期化したとき' do
  before(:all) do
    @db_accessor = DbAccessor.new(SpecParam, SpecLog)
  end

  it "masked_data_name をプロパティとして持つ" do
    @db_accessor.masked_data_name.should_not be_nil
  end

  it "SpecParamのmask = 7なのでmasked_data_nameは、[board, nextMoves, prevMoves]である" do
    @db_accessor.masked_data_name.should == ['board','nextMoves','prevMoves']
  end
end

describe DbAccessor, 'log_formatのテスト' do
  before(:all) do
    @db_accessor = DbAccessor.new(SpecParam, SpecLog)
    @db_accessor.determine_bid_range
    @db_accessor.get_msg
  end

  it "gotten をプロパティとして持つ" do
    @db_accessor.gotten.should_not be_nil
    SpecLog.debug(@db_accessor.log_format @db_accessor.gotten)
  end

  it "SpecParamのmask = 7なのでgottenのkeysは、[board, nextMoves, prevMoves]である" do
    @db_accessor.gotten.keys.sort.should == ['board','nextMoves','prevMoves'].sort
  end

  it "gottenには、nxt_bidに1を持つmoveは存在しない" do
    @db_accessor.gotten['nextMoves'].select{|h| h[:nxt_bid] == 1 }.should be_empty
    @db_accessor.gotten['prevMoves'].select{|h| h[:nxt_bid] == 1 }.should be_empty
  end
end

describe DbAccessor, "bidを起点にして取得した値なら、gotten['board']にはそのbidのBoardオブジェクトをあらわす要素をひとつだけ持つ" do
  [1,10,20].each{|bid|
    it "bid = #{bid}のとき" do
      SpecParam['bid'] = bid
      @db_accessor = DbAccessor.new(SpecParam, SpecLog)
      @db_accessor.determine_bid_range
      @db_accessor.get_msg
      @db_accessor.gotten['board'].select{|h| h[:bid] == bid }.size.should == 1
    end
  }
end

describe DbAccessor, "1以外のbidを起点にして取得した値なら、gotten['prevMoves']にはそのbidをnxt_bidにもつMoveオブジェクトをあらわす要素をすくなくともひとつ持つ" do
  [3,10,20].each{|bid|
    it "bid = #{bid}のとき" do
      SpecParam['bid'] = bid
      @db_accessor = DbAccessor.new(SpecParam, SpecLog)
      @db_accessor.determine_bid_range
      @db_accessor.get_msg
      @db_accessor.gotten['prevMoves'].select{|h| h[:nxt_bid] == bid }.size.should >= 1
    end
  }
end
