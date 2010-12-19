# -*- coding: utf-8 -*-
# vim: set fileencoding=utf-8 :
#
#  store.rb
#
require 'lib/util.rb'
require 'lib/db_accessor.rb'

class Store < Hash
  def initialize(logger=Logger.new('log/store.log'))
    @logger = logger
    @current_bid = 1
    @dba = DbAccessor.new
    @keys = %w[board nextMoves prevMoves movePointsByUser movePointsAverage moveComments boardPointByUser boardPointAverage boardComments]
  end
  attr_accessor :current_bid, :dba

  def fromState(state)
    self[@current_bid] = state.get(@current_bid, 'dummy')
  end

  def update_store(params=nil)
    params = params ||
	{'bid'	=> @current_bid,
	'mask'	=> 7,
	'level'	=> 3,
	'range' => 'full'}
    @dba.read_params(params)
    @dba.set_masked_data_name
    @dba.determine_bid_range
    @dba.get_msg
    @logger.debug(@dba.log_format @dba.gotten)
    read_from_db @dba.gotten
  end

  def read_from_db(data)
    self.merge! data
  end
  #
  #  get_section
  #    入力: bid 数値 targetとなるsectionのキーになるbid
  #    出力: Hash stateの元となるデータ
  def get_section(bid, move)
    @logger.debug("into get_section with #{bid}, #{move.inspect}")
    ret = {}
    if target_bid = find_move(bid, move)
      ret['bid']   = target_bid
      ret['board'] = self['board'].select{|h| h[:bid] == target_bid }
      ret['next']  = self['nextMoves'].select{|h| h[:bid] == target_bid }
      ret['prev']  = self['prevMoves'].select{|h| h[:bid] == target_bid }
    else
      result = @dba.regist_board(board)
      ret['bid']   = result['board'][0][:bid]
      ret = result
      self.merge! result # ここは怪しい！！
    end
    ret
  end
  #
  #  find_move
  #    Storeの中から指し手を探す
  #    入力: bid : 捜索対象のセクションのbid
  #        : move : 探したい指し手のMove オブジェクト
  #    出力: bid 数値 指し手が見つかったとき、その指し手のnxt_bidを返す
  #          nil      指し手が見つからなかったとき、nilを返す
  def find_move(bid, move)
    res = self['nextMoves'].select{|h| h[:bid] == bid }.find{|e|
            (e[:m_from]  == move[:m_from]) &&
            (e[:m_to]    == move[:m_to]) &&
            (e[:piece]   == move[:piece]) &&
            (e[:promote] == move[:promote])
      }
    if res
      return res[:nxt_bid]
    else
      return nil
    end
  end
end
