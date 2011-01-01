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
    @logger.debug("into update_store")
    @logger.debug("@current_bid is : #@current_bid")
    params = params ||
	{'bid'	=> @current_bid,
	'mask'	=> 7,
	'level'	=> 3,
	'range' => 'full'}
    @dba.read_params(params)
    @dba.set_masked_data_name
    @dba.determine_bid_range
    @dba.get_msg
    @logger.debug("after update : #{@dba.log_format @dba.gotten}")
    read_from_db @dba.gotten
  end

  def read_from_db(data)
    self.merge! data
    @logger.debug("read_from_db : #{@dba.log_format self}")
  end
  #
  #  complement(board, move)
  #    機能：情報の足りないBoard,Moveオブジェクトを受け取り補完して返す
  #          副作用としてStoreをupdateする
  #    入力: board Boardオブジェクト bidが足りない
  #        : move  Moveオブジェクト  mid, nxt_bidが足りない
  #    出力: 上記オブジェクト
  def complement(board, move)
    @logger.debug("into complement with board : #{board.to_log}")
    @logger.debug("into complement with move : #{move.inspect}")
    if complemented_move = find_move(move)
      @logger.debug("move found : #{complemented_move.inspect}")
      board.bid = complemented_move[:nxt_bid]
      @logger.debug("board.bid became  : #{board.bid}")
      # nextMovesの中にみつかっても、sectionを持っているとは限らないので
      # チェックして
      if self['board'].select{|h| h[:bid] == board.bid }.empty?
        # なければupdate_storeする
        @current_bid = board.bid
        update_store
        # このときはregist_boardは必要ない。nextMovesにあるということは
        # 新しい盤面は既にDBにあるということなので。
      end
    else
      #    みつからないときは、一度Storeをupdateしてから探し、それでも
      #    みつからないときに、regist_boardしてsectionを得る
      @current_bid = move[:bid]
      update_store
      if complemented_move = find_move(move)
        board.bid = complemented_move[:nxt_bid]
      else
        params =
         {'board'	=> board.board,
  	'black' => board.black,
  	'white' => board.white,
  	'turn'  => board.turn,
  	'from'  => move[:m_from],
  	'to'    => move[:m_to],
  	'piece' => move[:piece],
  	'promote' => move[:promote],
  	'oldbid' => move[:bid],
  	'mask'	=> 7,
  	'level'	=> 3,
  	'range' => 'full'}
        @logger.debug("going to regist_board with params : #{params.inspect}")
        @dba.read_params(params) # regist_boardのためのパラメータ渡し
          # ただし、これで本当によいか確認が必要 2010.12.21
        result = @dba.regist_board
        board.bid         = result['board'][0]['bid']
        complemented_move = result['prevMoves'][0]
        self.merge! result # ここは怪しい！！
          # regist_boardの返り値とStoreの構造って同じだっけ？？
      end
    end
    @logger.debug("leaving complement with #{board.inspect}, #{move.inspect}")
    return [board, complemented_move]
  end
  #
  #  get_section(bid)
  #    機能: 指定されたbidのsectionを返す
  #    入力: bid 数値
  #    出力: sectionを表すHash
  def get_section(bid)
    @logger.debug("into get_section with #{bid}")
    bid = bid.to_i
    buf = ''
    @logger.debug("self : #{PP::pp(self,buf);buf}")
    ret = {}
    ret['bid']   = bid
    ret['board'] = self['board'].select{|h| (h['bid'] || h[:bid]).to_i == bid }
    ret['next']  = self['nextMoves'].select{|h| (h['bid'] || h[:bid]).to_i == bid }
    ret['prev']  = self['prevMoves'].select{|h| (h['nxt_bid'] || h[:nxt_bid]).to_i == bid }
        # これでよい？nxt_bid?
    @logger.debug("leaving get_section with #{@dba.log_format ret}")
    return ret
  end
  
  #
  #  find_move
  #    Storeの中から指し手を探す
  #    入力: move : 探したい指し手のMove オブジェクト
  #    出力: Move オブジェクト 見つかったとき、その指し手
  #          nil  指し手が見つからなかったとき、nilを返す
  def find_move(move)
    @logger.debug("into find_move with #{move.inspect}")
    res = self['nextMoves'].select{|h| h[:bid] == move[:bid] }.find{|e|
            (e[:m_from]  == move[:m_from]) &&
            (e[:m_to]    == move[:m_to]) &&
            (e[:piece]   == move[:piece]) &&
            (e[:promote] == move[:promote])
      }
    if res
      @logger.debug("leaving find_move with #{res.inspect}")
      return res
    else
      @logger.debug("leaving find_move with nil")
      return nil
    end
  end
end
